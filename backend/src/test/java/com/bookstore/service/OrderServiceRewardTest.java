package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Coupon;
import com.bookstore.entity.DiscountType;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.PointTransaction;
import com.bookstore.entity.Role;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit test cho OrderService - Phần điểm thưởng và huỷ đơn.
 *
 * Phạm vi kiểm thử:
 *  - confirmOrderReceived(): xác nhận nhận hàng, cộng điểm theo hạng thành viên,
 *    tặng 20.000 điểm và coupon freeship cho đơn hàng đầu tiên
 *  - userCancelOrder(): huỷ đơn, hoàn điểm Y-Point, hoàn tồn kho
 *
 * Áp dụng kỹ thuật phân tích GIÁ TRỊ BIÊN cho ngưỡng hạng thành viên:
 *  Đồng < 5.000 | Bạc >= 5.000 | Vàng >= 30.000 | Kim Cương >= 100.000
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService - Unit Test (Điểm thưởng & Huỷ đơn)")
class OrderServiceRewardTest {

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

    private static final String USERNAME = "nguyenvana";
    private static final String USERNAME_KHAC = "tranvanb";

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username(USERNAME)
                .email("a@example.com")
                .fullName("Nguyen Van A")
                .role(Role.USER)
                .yPoints(0)
                .accumulatedPoints(0)
                .totalSpent(0.0)
                .build();
    }

    /** Tạo đơn hàng gắn với user mặc định. */
    private Order taoDonHang(String status, ShippingStatus shippingStatus, double tongTien) {
        return Order.builder()
                .id(1L)
                .user(user)
                .status(status)
                .shippingStatus(shippingStatus)
                .totalAmount(tongTien)
                .paymentMethod("COD")
                .items(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();
    }

    /** Tạo một cuốn sách thật để kiểm tra việc hoàn tồn kho. */
    private Book taoSach(Long id, int tonKho, Integer daBan) {
        return Book.builder()
                .id(id)
                .title("Sách kiểm thử")
                .price(BigDecimal.valueOf(100000))
                .oldPrice(BigDecimal.valueOf(120000))
                .stockQuantity(tonKho)
                .salesCount(daBan)
                .build();
    }

    /** Gắn một dòng sản phẩm vào đơn hàng. */
    private void themSanPham(Order order, Book book, int soLuong) {
        order.getItems().add(OrderItem.builder()
                .order(order)
                .book(book)
                .quantity(soLuong)
                .price(book.getPrice().doubleValue())
                .build());
    }

    /** Lấy giao dịch điểm đã được lưu để kiểm tra. */
    private PointTransaction layGiaoDichDiem() {
        ArgumentCaptor<PointTransaction> captor = ArgumentCaptor.forClass(PointTransaction.class);
        verify(pointTransactionRepository).save(captor.capture());
        return captor.getValue();
    }

    // ==================== XÁC NHẬN NHẬN HÀNG & CỘNG ĐIỂM ====================
    @Nested
    @DisplayName("confirmOrderReceived()")
    class XacNhanNhanHangTests {

        @Test
        @DisplayName("Đơn hàng đầu tiên: cộng điểm theo tỉ lệ và tặng thêm 20.000 điểm")
        void confirmOrderReceived_donDauTien_tang20KDiem() {
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 200_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(order));

            orderService.confirmOrderReceived(1L, USERNAME);

            // 200.000 * 0,5% = 1.000 điểm, cộng thêm 20.000 điểm quà đơn đầu
            assertThat(order.getStatus()).isEqualTo("COMPLETED");
            assertThat(user.getYPoints()).isEqualTo(21_000);
            assertThat(user.getAccumulatedPoints()).isEqualTo(21_000);
            assertThat(user.getTotalSpent()).isEqualTo(200_000.0);
            verify(userRepository).save(user);
            verify(orderRepository).save(order);
        }

        @Test
        @DisplayName("Đơn hàng đầu tiên: tặng kèm coupon FREESHIP trị giá 30.000, hạn 1 năm")
        void confirmOrderReceived_donDauTien_tangCouponFreeship() {
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 200_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(order));

            orderService.confirmOrderReceived(1L, USERNAME);

            ArgumentCaptor<Coupon> captor = ArgumentCaptor.forClass(Coupon.class);
            verify(couponRepository).save(captor.capture());
            Coupon coupon = captor.getValue();

            assertThat(coupon.getCode()).startsWith("FREESHIP_NEW_1_");
            assertThat(coupon.getDiscountType()).isEqualTo(DiscountType.FIXED);
            assertThat(coupon.getDiscountValue()).isEqualTo(30_000.0);
            assertThat(coupon.getMaxDiscountAmount()).isEqualTo(30_000.0);
            assertThat(coupon.getCategory()).isEqualTo("SHIPPING");
            assertThat(coupon.getUserId()).isEqualTo(1L);
            assertThat(coupon.getUsageLimit()).isEqualTo(1);
            assertThat(coupon.getIsActive()).isTrue();
            assertThat(coupon.getExpirationDate()).isAfter(LocalDateTime.now().plusMonths(11));
        }

        @Test
        @DisplayName("Đơn hàng đầu tiên: ghi giao dịch điểm EARN_ORDER với mô tả quà đơn đầu")
        void confirmOrderReceived_donDauTien_ghiGiaoDichDiem() {
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 200_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(order));

            orderService.confirmOrderReceived(1L, USERNAME);

            PointTransaction tx = layGiaoDichDiem();
            assertThat(tx.getAction()).isEqualTo("EARN_ORDER");
            assertThat(tx.getDescription()).contains("20K điểm đơn đầu");
            assertThat(tx.getPreviousBalance()).isEqualTo(0);
            assertThat(tx.getTransactionValue()).isEqualTo(21_000);
            assertThat(tx.getNewBalance()).isEqualTo(21_000);
        }

        @Test
        @DisplayName("Không phải đơn đầu tiên: không tặng 20.000 điểm, không tặng coupon")
        void confirmOrderReceived_khongPhaiDonDau_khongTangQua() {
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 200_000.0);
            Order donCu = taoDonHang("COMPLETED", ShippingStatus.DELIVERED, 100_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user))
                    .thenReturn(Arrays.asList(order, donCu));

            orderService.confirmOrderReceived(1L, USERNAME);

            assertThat(user.getYPoints()).isEqualTo(1_000);
            verify(couponRepository, never()).save(any(Coupon.class));

            PointTransaction tx = layGiaoDichDiem();
            assertThat(tx.getDescription()).doesNotContain("20K");
        }

        @Test
        @DisplayName("Giá trị biên hạng Đồng: 4.999 điểm tích luỹ áp tỉ lệ 0,5%")
        void confirmOrderReceived_bienHangDong_tiLe05PhanTram() {
            user.setAccumulatedPoints(4_999);
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 1_000_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user))
                    .thenReturn(Arrays.asList(order, order));

            orderService.confirmOrderReceived(1L, USERNAME);

            // 1.000.000 * 0,5% = 5.000
            assertThat(user.getYPoints()).isEqualTo(5_000);
            assertThat(user.getAccumulatedPoints()).isEqualTo(9_999);
        }

        @Test
        @DisplayName("Giá trị biên hạng Bạc: đúng 5.000 điểm tích luỹ áp tỉ lệ 0,5%")
        void confirmOrderReceived_bienHangBac_tiLe05PhanTram() {
            user.setAccumulatedPoints(5_000);
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 1_000_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user))
                    .thenReturn(Arrays.asList(order, order));

            orderService.confirmOrderReceived(1L, USERNAME);

            assertThat(user.getYPoints()).isEqualTo(5_000);
        }

        @Test
        @DisplayName("Giá trị biên hạng Vàng: đúng 30.000 điểm tích luỹ áp tỉ lệ 1%")
        void confirmOrderReceived_bienHangVang_tiLe1PhanTram() {
            user.setAccumulatedPoints(30_000);
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 1_000_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user))
                    .thenReturn(Arrays.asList(order, order));

            orderService.confirmOrderReceived(1L, USERNAME);

            // 1.000.000 * 1% = 10.000
            assertThat(user.getYPoints()).isEqualTo(10_000);
            assertThat(user.getAccumulatedPoints()).isEqualTo(40_000);
        }

        @Test
        @DisplayName("Giá trị biên dưới hạng Vàng: 29.999 điểm vẫn áp tỉ lệ 0,5%")
        void confirmOrderReceived_duoiBienHangVang_tiLe05PhanTram() {
            user.setAccumulatedPoints(29_999);
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 1_000_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user))
                    .thenReturn(Arrays.asList(order, order));

            orderService.confirmOrderReceived(1L, USERNAME);

            assertThat(user.getYPoints()).isEqualTo(5_000);
        }

        @Test
        @DisplayName("Giá trị biên hạng Kim Cương: đúng 100.000 điểm tích luỹ áp tỉ lệ 2%")
        void confirmOrderReceived_bienHangKimCuong_tiLe2PhanTram() {
            user.setAccumulatedPoints(100_000);
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 1_000_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user))
                    .thenReturn(Arrays.asList(order, order));

            orderService.confirmOrderReceived(1L, USERNAME);

            // 1.000.000 * 2% = 20.000
            assertThat(user.getYPoints()).isEqualTo(20_000);
            assertThat(user.getAccumulatedPoints()).isEqualTo(120_000);
        }

        @Test
        @DisplayName("Điểm thưởng bị làm tròn xuống khi ra số lẻ")
        void confirmOrderReceived_lamTronXuong() {
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 99_999.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user))
                    .thenReturn(Arrays.asList(order, order));

            orderService.confirmOrderReceived(1L, USERNAME);

            // 99.999 * 0,5% = 499,995 -> làm tròn xuống còn 499
            assertThat(user.getYPoints()).isEqualTo(499);
        }

        @Test
        @DisplayName("Tài khoản có các trường điểm null vẫn xử lý được, không ném NullPointerException")
        void confirmOrderReceived_truongDiemNull_khongLoi() {
            user.setYPoints(null);
            user.setAccumulatedPoints(null);
            user.setTotalSpent(null);

            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 100_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
            when(orderRepository.findByUserOrderByCreatedAtDesc(user))
                    .thenReturn(Arrays.asList(order, order));

            orderService.confirmOrderReceived(1L, USERNAME);

            assertThat(user.getYPoints()).isEqualTo(500);
            assertThat(user.getAccumulatedPoints()).isEqualTo(500);
            assertThat(user.getTotalSpent()).isEqualTo(100_000.0);
        }

        @Test
        @DisplayName("Ném lỗi khi không phải chủ đơn hàng")
        void confirmOrderReceived_saiChuDon_nemLoi() {
            Order order = taoDonHang("SHIPPED", ShippingStatus.DELIVERED, 100_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.confirmOrderReceived(1L, USERNAME_KHAC))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Bạn không có quyền thao tác đơn hàng này!");

            verifyNoInteractions(userRepository, pointTransactionRepository, couponRepository);
        }

        @Test
        @DisplayName("Ném lỗi khi đơn hàng đã được xác nhận hoàn thành trước đó")
        void confirmOrderReceived_daHoanThanh_nemLoi() {
            Order order = taoDonHang("COMPLETED", ShippingStatus.DELIVERED, 100_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.confirmOrderReceived(1L, USERNAME))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Đơn hàng đã được xác nhận hoàn thành!");

            verifyNoInteractions(userRepository, pointTransactionRepository);
        }
    }

    // ==================== HUỶ ĐƠN & HOÀN TRẢ ====================
    @Nested
    @DisplayName("userCancelOrder()")
    class HuyDonTests {

        @Test
        @DisplayName("Huỷ đơn COD: chuyển sang CANCELLED và huỷ luôn trạng thái giao hàng")
        void userCancelOrder_donCOD_chuyenSangCancelled() {
            Order order = taoDonHang("PENDING", ShippingStatus.PENDING, 200_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.userCancelOrder(1L, USERNAME);

            assertThat(order.getStatus()).isEqualTo("CANCELLED");
            assertThat(order.getShippingStatus()).isEqualTo(ShippingStatus.CANCELLED);
            verify(orderRepository).save(order);
        }

        @Test
        @DisplayName("Huỷ đơn online đã thanh toán: chuyển sang REFUNDED để hoàn tiền")
        void userCancelOrder_onlineDaThanhToan_chuyenSangRefunded() {
            Order order = taoDonHang("PENDING", ShippingStatus.PENDING, 200_000.0);
            order.setPaymentMethod("VNPAY");
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.userCancelOrder(1L, USERNAME);

            assertThat(order.getStatus()).isEqualTo("REFUNDED");
        }

        @Test
        @DisplayName("Huỷ đơn online chưa thanh toán: chuyển sang CANCELLED, không hoàn tiền")
        void userCancelOrder_onlineChuaThanhToan_chuyenSangCancelled() {
            Order order = taoDonHang("PENDING_PAYMENT", ShippingStatus.PENDING, 200_000.0);
            order.setPaymentMethod("VNPAY");
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.userCancelOrder(1L, USERNAME);

            assertThat(order.getStatus()).isEqualTo("CANCELLED");
        }

        @Test
        @DisplayName("Hoàn lại đúng số điểm Y-Point đã dùng và ghi giao dịch REFUND_ORDER")
        void userCancelOrder_hoanDiemYPoint() {
            user.setYPoints(1_000);
            Order order = taoDonHang("PENDING", ShippingStatus.PENDING, 200_000.0);
            order.setPointsUsed(5_000);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.userCancelOrder(1L, USERNAME);

            assertThat(user.getYPoints()).isEqualTo(6_000);
            verify(userRepository).save(user);

            PointTransaction tx = layGiaoDichDiem();
            assertThat(tx.getAction()).isEqualTo("REFUND_ORDER");
            assertThat(tx.getPreviousBalance()).isEqualTo(1_000);
            assertThat(tx.getTransactionValue()).isEqualTo(5_000);
            assertThat(tx.getNewBalance()).isEqualTo(6_000);
        }

        @Test
        @DisplayName("Không ghi giao dịch điểm khi đơn hàng không dùng Y-Point")
        void userCancelOrder_khongDungDiem_khongGhiGiaoDich() {
            Order order = taoDonHang("PENDING", ShippingStatus.PENDING, 200_000.0);
            order.setPointsUsed(0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.userCancelOrder(1L, USERNAME);

            verifyNoInteractions(pointTransactionRepository);
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Hoàn tồn kho và giảm số lượng đã bán cho từng sản phẩm trong đơn")
        void userCancelOrder_hoanTonKho() {
            Order order = taoDonHang("PENDING", ShippingStatus.PENDING, 200_000.0);
            Book sach1 = taoSach(10L, 8, 5);
            Book sach2 = taoSach(11L, 3, 10);
            themSanPham(order, sach1, 2);
            themSanPham(order, sach2, 4);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.userCancelOrder(1L, USERNAME);

            assertThat(sach1.getStockQuantity()).isEqualTo(10);
            assertThat(sach1.getSalesCount()).isEqualTo(3);
            assertThat(sach2.getStockQuantity()).isEqualTo(7);
            assertThat(sach2.getSalesCount()).isEqualTo(6);
            verify(bookRepository, times(2)).save(any(Book.class));
        }

        @Test
        @DisplayName("Số lượng đã bán không bao giờ bị âm khi hoàn tồn kho")
        void userCancelOrder_salesCountKhongAm() {
            Order order = taoDonHang("PENDING", ShippingStatus.PENDING, 200_000.0);
            Book sach = taoSach(10L, 5, 1);
            themSanPham(order, sach, 3);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.userCancelOrder(1L, USERNAME);

            assertThat(sach.getStockQuantity()).isEqualTo(8);
            assertThat(sach.getSalesCount()).isZero();
        }

        @Test
        @DisplayName("Sản phẩm chưa có số lượng đã bán (null) vẫn hoàn tồn kho bình thường")
        void userCancelOrder_salesCountNull_khongLoi() {
            Order order = taoDonHang("PENDING", ShippingStatus.PENDING, 200_000.0);
            Book sach = taoSach(10L, 5, null);
            themSanPham(order, sach, 2);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            orderService.userCancelOrder(1L, USERNAME);

            assertThat(sach.getStockQuantity()).isEqualTo(7);
            assertThat(sach.getSalesCount()).isZero();
        }

        @Test
        @DisplayName("Ném lỗi khi người bán đã xác nhận giao hàng")
        void userCancelOrder_daXacNhanGiaoHang_nemLoi() {
            Order order = taoDonHang("SHIPPED", ShippingStatus.SHIPPING, 200_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.userCancelOrder(1L, USERNAME))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("chưa xác nhận giao hàng");

            verify(orderRepository, never()).save(any(Order.class));
            verifyNoInteractions(bookRepository, pointTransactionRepository);
        }

        @Test
        @DisplayName("Ném lỗi khi không phải chủ đơn hàng")
        void userCancelOrder_saiChuDon_nemLoi() {
            Order order = taoDonHang("PENDING", ShippingStatus.PENDING, 200_000.0);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderService.userCancelOrder(1L, USERNAME_KHAC))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Bạn không có quyền huỷ đơn hàng này!");

            verifyNoInteractions(bookRepository, userRepository, pointTransactionRepository);
        }
    }
}