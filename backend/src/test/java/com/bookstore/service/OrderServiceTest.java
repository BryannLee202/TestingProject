package com.bookstore.service;

import com.bookstore.dto.ReturnRequest;
import com.bookstore.entity.Book;
import com.bookstore.entity.Coupon;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.ShippingStatus;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.PointTransactionRepository;
import com.bookstore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit test cho OrderService - Phần 1.
 *
 * Phạm vi kiểm thử:
 *  - Nhóm truy vấn đơn hàng (getOrderById, getOrdersByUser, getAllOrders)
 *  - Nhóm cập nhật trạng thái giao hàng (updateOrderShipping)
 *  - Nhóm trả hàng / hoàn tiền (userReturnOrder, adminApproveReturn, adminRejectReturn)
 *  - Nhóm thanh toán (confirmVNPayPayment, updatePaymentMethod)
 *  - Nhóm xoá đơn và job huỷ đơn quá hạn
 *
 * Toàn bộ dependency đều được mock để cô lập logic nghiệp vụ, không đụng tới DB thật.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService - Unit Test (Phần 1)")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private CartService cartService;

    @Mock
    private CouponService couponService;

    @Mock
    private PointTransactionRepository pointTransactionRepository;

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private OrderService orderService;

    private static final String USERNAME = "a@example.com";
    private static final String USERNAME_KHAC = "b@example.com";

    private User user;

    @BeforeEach
    void setUp() {
        user = mock(User.class);
    }

    /** Tạo nhanh một đơn hàng phục vụ kiểm thử. */
    private Order taoDonHang(Long id, String status, ShippingStatus shippingStatus) {
        return Order.builder()
                .id(id)
                .user(user)
                .status(status)
                .shippingStatus(shippingStatus)
                .items(new ArrayList<>())
                .paymentMethod("COD")
                .createdAt(LocalDateTime.now())
                .build();
    }

    /** Gắn một dòng sản phẩm vào đơn hàng, trả về Book đã mock. */
    private Book themSanPham(Order order, Long bookId, int soLuong) {
        Book book = mock(Book.class);
        when(book.getId()).thenReturn(bookId);
        order.getItems().add(OrderItem.builder()
                .order(order)
                .book(book)
                .quantity(soLuong)
                .build());
        return book;
    }

    /** Cho orderRepository.save() trả lại chính đối tượng được truyền vào. */
    private void gaLapSaveOrder() {
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    // ==================== TRUY VẤN ĐƠN HÀNG ====================
    @Nested
    @DisplayName("Truy vấn đơn hàng")
    class TruyVanTests {

        @Test
        @DisplayName("getOrderById trả về đơn hàng khi tồn tại")
        void getOrderById_tonTai_traVeDonHang() {
            Order order = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            Order ketQua = orderService.getOrderById(1L);

            assertThat(ketQua).isSameAs(order);
        }

        @Test
        @DisplayName("getOrderById ném lỗi khi đơn hàng không tồn tại")
        void getOrderById_khongTonTai_nemLoi() {
            when(orderRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.getOrderById(99L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy đơn hàng!");
        }

        @Test
        @DisplayName("getOrdersByUser trả về danh sách đơn của đúng người dùng")
        void getOrdersByUser_thanhCong() {
            Order order = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(order));

            List<Order> ketQua = orderService.getOrdersByUser(USERNAME);

            assertThat(ketQua).containsExactly(order);
        }

        @Test
        @DisplayName("getOrdersByUser ném lỗi khi tài khoản không tồn tại")
        void getOrdersByUser_userKhongTonTai_nemLoi() {
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.getOrdersByUser(USERNAME))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Tài khoản không tồn tại");

            verifyNoInteractions(orderRepository);
        }

        @Test
        @DisplayName("getAllOrders trả về toàn bộ đơn hàng sắp xếp theo ngày tạo")
        void getAllOrders_traVeToanBo() {
            Order o1 = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            Order o2 = taoDonHang(2L, "COMPLETED", ShippingStatus.DELIVERED);
            when(orderRepository.findAllByOrderByCreatedAtDesc()).thenReturn(Arrays.asList(o1, o2));

            assertThat(orderService.getAllOrders()).hasSize(2).containsExactly(o1, o2);
        }
    }

    // ==================== CẬP NHẬT TRẠNG THÁI GIAO HÀNG ====================
    @Nested
    @DisplayName("updateOrderShipping()")
    class CapNhatGiaoHangTests {

        @Test
        @DisplayName("Trạng thái DELIVERED đồng bộ đơn hàng sang SHIPPED")
        void updateOrderShipping_delivered_dongBoSangShipped() {
            Order order = taoDonHang(1L, "PROCESSING", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            gaLapSaveOrder();

            Order ketQua = orderService.updateOrderShipping(1L, "DELIVERED", "GHN", "TRK-001");

            assertThat(ketQua.getShippingStatus()).isEqualTo(ShippingStatus.DELIVERED);
            assertThat(ketQua.getStatus()).isEqualTo("SHIPPED");
            assertThat(ketQua.getShippingPartner()).isEqualTo("GHN");
            assertThat(ketQua.getTrackingNumber()).isEqualTo("TRK-001");
        }

        @Test
        @DisplayName("Trạng thái SHIPPING cũng đồng bộ đơn hàng sang SHIPPED")
        void updateOrderShipping_shipping_dongBoSangShipped() {
            Order order = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            gaLapSaveOrder();

            Order ketQua = orderService.updateOrderShipping(1L, "SHIPPING", null, null);

            assertThat(ketQua.getShippingStatus()).isEqualTo(ShippingStatus.SHIPPING);
            assertThat(ketQua.getStatus()).isEqualTo("SHIPPED");
        }

        @Test
        @DisplayName("Trạng thái CANCELLED đồng bộ đơn hàng sang CANCELLED")
        void updateOrderShipping_cancelled_dongBoSangCancelled() {
            Order order = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            gaLapSaveOrder();

            Order ketQua = orderService.updateOrderShipping(1L, "CANCELLED", null, null);

            assertThat(ketQua.getShippingStatus()).isEqualTo(ShippingStatus.CANCELLED);
            assertThat(ketQua.getStatus()).isEqualTo("CANCELLED");
        }

        @Test
        @DisplayName("Trạng thái khác (PENDING) đưa đơn hàng về PROCESSING")
        void updateOrderShipping_trangThaiKhac_veProcessing() {
            Order order = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            gaLapSaveOrder();

            Order ketQua = orderService.updateOrderShipping(1L, "PENDING", null, null);

            assertThat(ketQua.getStatus()).isEqualTo("PROCESSING");
        }

        @Test
        @DisplayName("Không truyền status thì giữ nguyên trạng thái, chỉ cập nhật vận đơn")
        void updateOrderShipping_statusNull_giuNguyenTrangThai() {
            Order order = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            gaLapSaveOrder();

            Order ketQua = orderService.updateOrderShipping(1L, null, "GHTK", "TRK-002");

            assertThat(ketQua.getStatus()).isEqualTo("PENDING");
            assertThat(ketQua.getShippingStatus()).isEqualTo(ShippingStatus.PENDING);
            assertThat(ketQua.getShippingPartner()).isEqualTo("GHTK");
        }

        @Test
        @DisplayName("Ném lỗi khi truyền trạng thái giao hàng không hợp lệ")
        void updateOrderShipping_statusKhongHopLe_nemLoi() {
            Order order = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.updateOrderShipping(1L, "KHONG_TON_TAI", null, null))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(orderRepository, never()).save(any(Order.class));
        }
    }

    // ==================== TRẢ HÀNG / HOÀN TIỀN ====================
    @Nested
    @DisplayName("Trả hàng và hoàn tiền")
    class TraHangTests {

        @Test
        @DisplayName("userReturnOrder chuyển đơn COMPLETED sang RETURNED và lưu thông tin trả hàng")
        void userReturnOrder_thanhCong() {
            Order order = taoDonHang(1L, "COMPLETED", ShippingStatus.DELIVERED);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(user.getUsername()).thenReturn(USERNAME);

            ReturnRequest yeuCau = mock(ReturnRequest.class);
            when(yeuCau.getReason()).thenReturn("Sách bị rách bìa");
            when(yeuCau.getPhone()).thenReturn("0900000000");
            when(yeuCau.getBank()).thenReturn("Vietcombank - 123456789");
            when(yeuCau.getDetails()).thenReturn("Rách góc trên bên phải");

            orderService.userReturnOrder(1L, USERNAME, yeuCau);

            assertThat(order.getStatus()).isEqualTo("RETURNED");
            assertThat(order.getReturnReason()).isEqualTo("Sách bị rách bìa");
            assertThat(order.getReturnPhone()).isEqualTo("0900000000");
            assertThat(order.getReturnBank()).isEqualTo("Vietcombank - 123456789");
            verify(orderRepository).save(order);
        }

        @Test
        @DisplayName("userReturnOrder ném lỗi khi không phải chủ đơn hàng")
        void userReturnOrder_saiChuDon_nemLoi() {
            Order order = taoDonHang(1L, "COMPLETED", ShippingStatus.DELIVERED);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(user.getUsername()).thenReturn(USERNAME);

            assertThatThrownBy(() -> orderService.userReturnOrder(1L, USERNAME_KHAC, null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Bạn không có quyền thao tác đơn hàng này!");

            verify(orderRepository, never()).save(any(Order.class));
        }

        @Test
        @DisplayName("userReturnOrder ném lỗi khi đơn hàng chưa hoàn thành")
        void userReturnOrder_chuaHoanThanh_nemLoi() {
            Order order = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(user.getUsername()).thenReturn(USERNAME);

            assertThatThrownBy(() -> orderService.userReturnOrder(1L, USERNAME, null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("đã hoàn thành");
        }

        @Test
        @DisplayName("adminApproveReturn chuyển đơn RETURNED sang REFUNDED")
        void adminApproveReturn_thanhCong() {
            Order order = taoDonHang(1L, "RETURNED", ShippingStatus.DELIVERED);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.adminApproveReturn(1L);

            assertThat(order.getStatus()).isEqualTo("REFUNDED");
            verify(orderRepository).save(order);
        }

        @Test
        @DisplayName("adminApproveReturn ném lỗi khi đơn không ở trạng thái RETURNED")
        void adminApproveReturn_saiTrangThai_nemLoi() {
            Order order = taoDonHang(1L, "COMPLETED", ShippingStatus.DELIVERED);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.adminApproveReturn(1L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("đang yêu cầu trả hàng");

            verify(orderRepository, never()).save(any(Order.class));
        }

        @Test
        @DisplayName("adminRejectReturn đưa đơn về COMPLETED và xoá sạch thông tin trả hàng")
        void adminRejectReturn_thanhCong() {
            Order order = taoDonHang(1L, "RETURNED", ShippingStatus.PENDING);
            order.setReturnReason("Sách bị rách bìa");
            order.setReturnPhone("0900000000");
            order.setReturnBank("Vietcombank");
            order.setReturnDetails("Chi tiết");
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.adminRejectReturn(1L);

            assertThat(order.getStatus()).isEqualTo("COMPLETED");
            assertThat(order.getShippingStatus()).isEqualTo(ShippingStatus.DELIVERED);
            assertThat(order.getReturnReason()).isNull();
            assertThat(order.getReturnPhone()).isNull();
            assertThat(order.getReturnBank()).isNull();
            assertThat(order.getReturnDetails()).isNull();
        }

        @Test
        @DisplayName("adminRejectReturn ném lỗi khi đơn không ở trạng thái RETURNED")
        void adminRejectReturn_saiTrangThai_nemLoi() {
            Order order = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.adminRejectReturn(1L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("đang yêu cầu trả hàng");
        }
    }

    // ==================== THANH TOÁN VNPAY ====================
    @Nested
    @DisplayName("confirmVNPayPayment()")
    class ThanhToanVNPayTests {

        @Test
        @DisplayName("Thanh toán thành công: chuyển PENDING, xoá giỏ hàng, tiêu coupon")
        void confirmVNPayPayment_thanhCong() {
            Order order = taoDonHang(1L, "PENDING_PAYMENT", ShippingStatus.PENDING);
            themSanPham(order, 5L, 2);
            order.setDiscountCouponCode("SALE50");
            order.setShippingCouponCode("FREESHIP_1");

            Coupon couponGiamGia = Coupon.builder().code("SALE50").build();
            Coupon couponVanChuyen = Coupon.builder().code("FREESHIP_1").build();

            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(user.getUsername()).thenReturn(USERNAME);
            when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue("SALE50"))
                    .thenReturn(Optional.of(couponGiamGia));
            when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue("FREESHIP_1"))
                    .thenReturn(Optional.of(couponVanChuyen));

            orderService.confirmVNPayPayment(1L, true);

            assertThat(order.getStatus()).isEqualTo("PENDING");
            verify(orderRepository).save(order);
            verify(cartService).removeCartItem(USERNAME, 5L);
            verify(couponService).useCoupon(couponGiamGia);
            verify(couponService).useCoupon(couponVanChuyen);
        }

        @Test
        @DisplayName("Thanh toán thất bại: đơn hàng giữ nguyên PENDING_PAYMENT")
        void confirmVNPayPayment_thatBai_giuNguyenTrangThai() {
            Order order = taoDonHang(1L, "PENDING_PAYMENT", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.confirmVNPayPayment(1L, false);

            assertThat(order.getStatus()).isEqualTo("PENDING_PAYMENT");
            verify(orderRepository, never()).save(any(Order.class));
            verifyNoInteractions(cartService, couponService);
        }

        @Test
        @DisplayName("Bỏ qua khi đơn hàng không còn ở trạng thái chờ thanh toán")
        void confirmVNPayPayment_khongPhaiChoThanhToan_boQua() {
            Order order = taoDonHang(1L, "COMPLETED", ShippingStatus.DELIVERED);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.confirmVNPayPayment(1L, true);

            assertThat(order.getStatus()).isEqualTo("COMPLETED");
            verify(orderRepository, never()).save(any(Order.class));
            verifyNoInteractions(cartService, couponService);
        }

        @Test
        @DisplayName("Ném lỗi khi đơn hàng không tồn tại")
        void confirmVNPayPayment_donKhongTonTai_nemLoi() {
            when(orderRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.confirmVNPayPayment(99L, true))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Order not found");
        }
    }

    // ==================== ĐỔI PHƯƠNG THỨC THANH TOÁN ====================
    @Nested
    @DisplayName("updatePaymentMethod()")
    class DoiPhuongThucThanhToanTests {

        @Test
        @DisplayName("Đổi sang COD: đơn về PENDING, xoá giỏ hàng và tiêu coupon")
        void updatePaymentMethod_sangCOD_thanhCong() {
            Order order = taoDonHang(1L, "PENDING_PAYMENT", ShippingStatus.PENDING);
            order.setPaymentMethod("VNPAY");
            themSanPham(order, 5L, 1);
            order.setDiscountCouponCode("SALE50");

            Coupon coupon = Coupon.builder().code("SALE50").build();

            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(user.getUsername()).thenReturn(USERNAME);
            when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue("SALE50"))
                    .thenReturn(Optional.of(coupon));
            gaLapSaveOrder();

            Order ketQua = orderService.updatePaymentMethod(1L, "COD", USERNAME);

            assertThat(ketQua.getPaymentMethod()).isEqualTo("COD");
            assertThat(ketQua.getStatus()).isEqualTo("PENDING");
            verify(cartService).removeCartItem(USERNAME, 5L);
            verify(couponService).useCoupon(coupon);
        }

        @Test
        @DisplayName("Đổi sang thanh toán online: đơn chuyển về PENDING_PAYMENT, không đụng giỏ hàng")
        void updatePaymentMethod_sangOnline_thanhCong() {
            Order order = taoDonHang(1L, "PENDING", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(user.getUsername()).thenReturn(USERNAME);
            gaLapSaveOrder();

            Order ketQua = orderService.updatePaymentMethod(1L, "VNPAY", USERNAME);

            assertThat(ketQua.getPaymentMethod()).isEqualTo("VNPAY");
            assertThat(ketQua.getStatus()).isEqualTo("PENDING_PAYMENT");
            verifyNoInteractions(cartService, couponService);
        }

        @Test
        @DisplayName("Ném lỗi khi không phải chủ đơn hàng")
        void updatePaymentMethod_saiChuDon_nemLoi() {
            Order order = taoDonHang(1L, "PENDING_PAYMENT", ShippingStatus.PENDING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(user.getUsername()).thenReturn(USERNAME);

            assertThatThrownBy(() -> orderService.updatePaymentMethod(1L, "COD", USERNAME_KHAC))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Bạn không có quyền thao tác đơn hàng này!");
        }

        @Test
        @DisplayName("Ném lỗi khi đơn hàng đã giao, không được đổi phương thức thanh toán")
        void updatePaymentMethod_trangThaiKhongChoPhep_nemLoi() {
            Order order = taoDonHang(1L, "SHIPPED", ShippingStatus.SHIPPING);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(user.getUsername()).thenReturn(USERNAME);

            assertThatThrownBy(() -> orderService.updatePaymentMethod(1L, "COD", USERNAME))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Không thể thay đổi phương thức thanh toán");

            verify(orderRepository, never()).save(any(Order.class));
        }
    }

    // ==================== XOÁ ĐƠN & JOB TỰ ĐỘNG ====================
    @Nested
    @DisplayName("Xoá đơn hàng và job huỷ đơn quá hạn")
    class XoaVaJobTests {

        @Test
        @DisplayName("deleteOrder xoá đơn hàng khi tồn tại")
        void deleteOrder_tonTai_xoaThanhCong() {
            when(orderRepository.existsById(1L)).thenReturn(true);

            orderService.deleteOrder(1L);

            verify(orderRepository).deleteById(1L);
        }

        @Test
        @DisplayName("deleteOrder ném lỗi khi đơn hàng không tồn tại")
        void deleteOrder_khongTonTai_nemLoi() {
            when(orderRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> orderService.deleteOrder(99L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy đơn hàng!");

            verify(orderRepository, never()).deleteById(anyLong());
        }

        @Test
        @DisplayName("deleteMultipleOrders xoá hàng loạt theo danh sách id")
        void deleteMultipleOrders_xoaHangLoat() {
            List<Long> danhSachId = Arrays.asList(1L, 2L, 3L);

            orderService.deleteMultipleOrders(danhSachId);

            verify(orderRepository).deleteAllById(danhSachId);
        }

        @Test
        @DisplayName("Job tự động xử lý các đơn chờ thanh toán quá 15 phút")
        void cancelExpiredPendingPaymentOrders_xuLyDonQuaHan() {
            Order donQuaHan = taoDonHang(1L, "PENDING_PAYMENT", ShippingStatus.PENDING);
            when(orderRepository.findByStatusAndCreatedAtBefore(eq("PENDING_PAYMENT"), any(LocalDateTime.class)))
                    .thenReturn(List.of(donQuaHan));
            when(orderRepository.findById(1L)).thenReturn(Optional.of(donQuaHan));

            orderService.cancelExpiredPendingPaymentOrders();

            assertThat(donQuaHan.getStatus()).isEqualTo("PENDING_PAYMENT");
            verify(orderRepository).findById(1L);
            verify(orderRepository, never()).save(any(Order.class));
        }

        @Test
        @DisplayName("Job không lỗi khi không có đơn nào quá hạn")
        void cancelExpiredPendingPaymentOrders_khongCoDon() {
            when(orderRepository.findByStatusAndCreatedAtBefore(eq("PENDING_PAYMENT"), any(LocalDateTime.class)))
                    .thenReturn(new ArrayList<>());

            orderService.cancelExpiredPendingPaymentOrders();

            verify(orderRepository, never()).findById(anyLong());
        }
    }
}
