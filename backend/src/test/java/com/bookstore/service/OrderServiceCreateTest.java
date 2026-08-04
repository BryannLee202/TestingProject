package com.bookstore.service;

import com.bookstore.dto.OrderRequest;
import com.bookstore.entity.Book;
import com.bookstore.entity.Coupon;
import com.bookstore.entity.Order;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit test cho OrderService.createOrder().
 *
 * Phạm vi kiểm thử:
 *  - Tạo đơn hàng theo phương thức COD và thanh toán online
 *  - Tính tiền: tạm tính, phí vận chuyển, tổng thanh toán
 *  - Chiết khấu VIP theo hạng thành viên và trần giảm giá tối đa 50%
 *  - Áp mã giảm giá sản phẩm và mã miễn phí vận chuyển
 *  - Khấu trừ điểm Y-Point
 *  - Trừ tồn kho, tăng số lượng đã bán, chặn khi không đủ hàng
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService.createOrder() - Unit Test")
class OrderServiceCreateTest {

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

    private User user;
    private OrderRequest request;

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

        request = new OrderRequest();
        request.setItems(new ArrayList<>());
        request.setShippingAddress("123 Nguyen Van Cu, Quan 5, TP.HCM");
        request.setPhoneNumber("0900000000");
        request.setPaymentMethod("COD");
        request.setShippingFee(30_000.0);
    }

    /** Thêm một dòng sản phẩm vào yêu cầu đặt hàng. */
    private void themDongHang(Long bookId, int soLuong, double donGia) {
        OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
        item.setBookId(bookId);
        item.setQuantity(soLuong);
        item.setPrice(donGia);
        request.getItems().add(item);
    }

    /** Tạo sách và khai báo cho bookRepository trả về nó. */
    private Book taoSach(Long id, double giaBan, Double giaCu, int tonKho, Integer daBan) {
        Book book = Book.builder()
                .id(id)
                .title("Sách kiểm thử " + id)
                .price(BigDecimal.valueOf(giaBan))
                .oldPrice(giaCu == null ? null : BigDecimal.valueOf(giaCu))
                .stockQuantity(tonKho)
                .salesCount(daBan)
                .build();
        when(bookRepository.findById(id)).thenReturn(Optional.of(book));
        return book;
    }

    /** Khai báo các stub dùng chung cho luồng tạo đơn thành công. */
    private void gaLapLuongCoBan() {
        when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
        when(orderRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(new ArrayList<>());
    }

    /** Khai báo cho orderRepository.save() trả lại chính đối tượng được truyền vào. */
    private void gaLapSaveOrder() {
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    /** Tạo một coupon phục vụ kiểm thử. */
    private Coupon taoCoupon(String code, String loai) {
        return Coupon.builder().code(code).category(loai).build();
    }

    // ==================== LUỒNG TẠO ĐƠN CƠ BẢN ====================
    @Nested
    @DisplayName("Luồng tạo đơn cơ bản")
    class LuongCoBanTests {

        @Test
        @DisplayName("Đơn COD được tạo với trạng thái PENDING và tính đúng tổng tiền")
        void createOrder_COD_trangThaiPending() {
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 5);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Order ketQua = orderService.createOrder(USERNAME, request);

            // Tạm tính 200.000 + phí ship 30.000 = 230.000
            assertThat(ketQua.getStatus()).isEqualTo("PENDING");
            assertThat(ketQua.getShippingStatus()).isEqualTo(ShippingStatus.PENDING);
            assertThat(ketQua.getTotalAmount()).isEqualTo(230_000.0);
            assertThat(ketQua.getDiscountAmount()).isEqualTo(0.0);
            assertThat(ketQua.getItems()).hasSize(1);
            assertThat(ketQua.getShippingAddress()).isEqualTo("123 Nguyen Van Cu, Quan 5, TP.HCM");
        }

        @Test
        @DisplayName("Đơn COD xoá sản phẩm khỏi giỏ hàng ngay khi đặt")
        void createOrder_COD_xoaGioHang() {
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 5);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            orderService.createOrder(USERNAME, request);

            verify(cartService).removeCartItem(USERNAME, 10L);
        }

        @Test
        @DisplayName("Đơn thanh toán online có trạng thái PENDING_PAYMENT và chưa xoá giỏ hàng")
        void createOrder_online_trangThaiChoThanhToan() {
            request.setPaymentMethod("VNPAY");
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 5);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Order ketQua = orderService.createOrder(USERNAME, request);

            assertThat(ketQua.getStatus()).isEqualTo("PENDING_PAYMENT");
            verifyNoInteractions(cartService);
        }

        @Test
        @DisplayName("Không truyền phí vận chuyển thì mặc định bằng 0")
        void createOrder_phiVanChuyenNull_macDinhBangKhong() {
            request.setShippingFee(null);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 5);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Order ketQua = orderService.createOrder(USERNAME, request);

            assertThat(ketQua.getShippingFee()).isEqualTo(0.0);
            assertThat(ketQua.getTotalAmount()).isEqualTo(200_000.0);
        }

        @Test
        @DisplayName("Đơn nhiều sản phẩm cộng dồn đúng tạm tính và xoá đủ các dòng giỏ hàng")
        void createOrder_nhieuSanPham_congDonDungTamTinh() {
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            taoSach(11L, 50_000, 50_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            themDongHang(11L, 3, 50_000.0);
            gaLapSaveOrder();

            Order ketQua = orderService.createOrder(USERNAME, request);

            // 200.000 + 150.000 + 30.000 = 380.000
            assertThat(ketQua.getTotalAmount()).isEqualTo(380_000.0);
            assertThat(ketQua.getItems()).hasSize(2);
            verify(cartService).removeCartItem(USERNAME, 10L);
            verify(cartService).removeCartItem(USERNAME, 11L);
        }

        @Test
        @DisplayName("Ném lỗi khi tài khoản không tồn tại")
        void createOrder_userKhongTonTai_nemLoi() {
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.createOrder(USERNAME, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Tài khoản không tồn tại");

            verifyNoInteractions(bookRepository, orderRepository);
        }

        @Test
        @DisplayName("Ném lỗi khi sách trong giỏ không còn tồn tại")
        void createOrder_sachKhongTonTai_nemLoi() {
            gaLapLuongCoBan();
            when(bookRepository.findById(99L)).thenReturn(Optional.empty());
            themDongHang(99L, 1, 100_000.0);

            assertThatThrownBy(() -> orderService.createOrder(USERNAME, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("không tồn tại hoặc đã ngừng kinh doanh");

            verify(orderRepository, never()).save(any(Order.class));
        }
    }

    // ==================== TỒN KHO ====================
    @Nested
    @DisplayName("Kiểm tra tồn kho")
    class TonKhoTests {

        @Test
        @DisplayName("Trừ tồn kho và tăng số lượng đã bán sau khi đặt hàng")
        void createOrder_truTonKhoVaTangSoLuongDaBan() {
            gaLapLuongCoBan();
            Book sach = taoSach(10L, 100_000, 100_000.0, 10, 5);
            themDongHang(10L, 3, 100_000.0);
            gaLapSaveOrder();

            orderService.createOrder(USERNAME, request);

            assertThat(sach.getStockQuantity()).isEqualTo(7);
            assertThat(sach.getSalesCount()).isEqualTo(8);
            verify(bookRepository).save(sach);
        }

        @Test
        @DisplayName("Giá trị biên: mua đúng bằng số lượng tồn kho vẫn đặt được, tồn kho về 0")
        void createOrder_muaDungBangTonKho_thanhCong() {
            gaLapLuongCoBan();
            Book sach = taoSach(10L, 100_000, 100_000.0, 3, 0);
            themDongHang(10L, 3, 100_000.0);
            gaLapSaveOrder();

            orderService.createOrder(USERNAME, request);

            assertThat(sach.getStockQuantity()).isZero();
        }

        @Test
        @DisplayName("Ném lỗi khi số lượng đặt vượt quá tồn kho")
        void createOrder_vuotTonKho_nemLoi() {
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 2, 0);
            themDongHang(10L, 3, 100_000.0);

            assertThatThrownBy(() -> orderService.createOrder(USERNAME, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("không đủ số lượng tồn kho");

            verify(bookRepository, never()).save(any(Book.class));
            verify(orderRepository, never()).save(any(Order.class));
        }

        @Test
        @DisplayName("Sách chưa có số lượng đã bán (null) vẫn cộng dồn đúng")
        void createOrder_soLuongDaBanNull_congDonDung() {
            gaLapLuongCoBan();
            Book sach = taoSach(10L, 100_000, 100_000.0, 10, null);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            orderService.createOrder(USERNAME, request);

            assertThat(sach.getSalesCount()).isEqualTo(2);
        }
    }

    // ==================== CHIẾT KHẤU VIP ====================
    @Nested
    @DisplayName("Chiết khấu theo hạng thành viên")
    class ChietKhauVipTests {

        @Test
        @DisplayName("Hạng Đồng (dưới 5.000 điểm) không được chiết khấu")
        void createOrder_hangDong_khongChietKhau() {
            user.setAccumulatedPoints(4_999);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Order ketQua = orderService.createOrder(USERNAME, request);

            assertThat(ketQua.getDiscountAmount()).isEqualTo(0.0);
            assertThat(ketQua.getTotalAmount()).isEqualTo(230_000.0);
        }

        @Test
        @DisplayName("Giá trị biên hạng Bạc: đúng 5.000 điểm được chiết khấu 2%")
        void createOrder_bienHangBac_chietKhau2PhanTram() {
            user.setAccumulatedPoints(5_000);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Order ketQua = orderService.createOrder(USERNAME, request);

            // 200.000 * 2% = 4.000
            assertThat(ketQua.getDiscountAmount()).isEqualTo(4_000.0);
            assertThat(ketQua.getTotalAmount()).isEqualTo(226_000.0);
        }

        @Test
        @DisplayName("Giá trị biên hạng Vàng: đúng 30.000 điểm được chiết khấu 5%")
        void createOrder_bienHangVang_chietKhau5PhanTram() {
            user.setAccumulatedPoints(30_000);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Order ketQua = orderService.createOrder(USERNAME, request);

            // 200.000 * 5% = 10.000
            assertThat(ketQua.getDiscountAmount()).isEqualTo(10_000.0);
            assertThat(ketQua.getTotalAmount()).isEqualTo(220_000.0);
        }

        @Test
        @DisplayName("Giá trị biên hạng Kim Cương: đúng 100.000 điểm được chiết khấu 10%")
        void createOrder_bienHangKimCuong_chietKhau10PhanTram() {
            user.setAccumulatedPoints(100_000);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Order ketQua = orderService.createOrder(USERNAME, request);

            // 200.000 * 10% = 20.000
            assertThat(ketQua.getDiscountAmount()).isEqualTo(20_000.0);
            assertThat(ketQua.getTotalAmount()).isEqualTo(210_000.0);
        }

        @Test
        @DisplayName("Chiết khấu VIP bị chặn khi sản phẩm đã giảm quá 50% so với giá gốc")
        void createOrder_vuotTranGiamGia_khongChietKhauThem() {
            user.setAccumulatedPoints(100_000);
            gaLapLuongCoBan();
            // Giá gốc 100.000 nhưng bán 40.000 -> đã giảm 60%, vượt trần 50%
            taoSach(10L, 40_000, 100_000.0, 10, 0);
            themDongHang(10L, 1, 40_000.0);
            gaLapSaveOrder();

            Order ketQua = orderService.createOrder(USERNAME, request);

            assertThat(ketQua.getDiscountAmount()).isEqualTo(0.0);
            assertThat(ketQua.getTotalAmount()).isEqualTo(70_000.0);
        }

        @Test
        @DisplayName("Sách không có giá gốc thì lấy giá bán làm mốc tính trần giảm giá")
        void createOrder_khongCoGiaCu_dungGiaBan() {
            user.setAccumulatedPoints(100_000);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, null, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Order ketQua = orderService.createOrder(USERNAME, request);

            assertThat(ketQua.getDiscountAmount()).isEqualTo(20_000.0);
        }
    }

    // ==================== MÃ GIẢM GIÁ ====================
    @Nested
    @DisplayName("Áp mã giảm giá và mã vận chuyển")
    class CouponTests {

        @Test
        @DisplayName("Áp mã giảm giá sản phẩm thành công và đánh dấu đã dùng với đơn COD")
        void createOrder_maGiamGia_apDungThanhCong() {
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Coupon coupon = taoCoupon("SALE50", "DISCOUNT");
            when(couponService.validateCoupon("SALE50", 200_000.0, USERNAME)).thenReturn(coupon);
            when(couponService.calculateDiscount(coupon, 200_000.0)).thenReturn(50_000.0);
            request.setDiscountCouponCode("SALE50");

            Order ketQua = orderService.createOrder(USERNAME, request);

            assertThat(ketQua.getDiscountCouponCode()).isEqualTo("SALE50");
            assertThat(ketQua.getDiscountAmount()).isEqualTo(50_000.0);
            assertThat(ketQua.getTotalAmount()).isEqualTo(180_000.0);
            verify(couponService).useCoupon(coupon);
        }

        @Test
        @DisplayName("Mã giảm giá bị cắt xuống bằng phần trần giảm giá còn lại")
        void createOrder_maGiamGiaVuotTran_biCat() {
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Coupon coupon = taoCoupon("SALE_ALL", "DISCOUNT");
            when(couponService.validateCoupon("SALE_ALL", 200_000.0, USERNAME)).thenReturn(coupon);
            when(couponService.calculateDiscount(coupon, 200_000.0)).thenReturn(200_000.0);
            request.setDiscountCouponCode("SALE_ALL");

            Order ketQua = orderService.createOrder(USERNAME, request);

            // Trần giảm tối đa 50% của 200.000 = 100.000
            assertThat(ketQua.getDiscountAmount()).isEqualTo(100_000.0);
            assertThat(ketQua.getTotalAmount()).isEqualTo(130_000.0);
        }

        @Test
        @DisplayName("Ném lỗi khi dùng mã vận chuyển vào ô mã giảm giá sản phẩm")
        void createOrder_maSaiLoai_nemLoi() {
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);

            Coupon coupon = taoCoupon("FREESHIP_X", "SHIPPING");
            when(couponService.validateCoupon("FREESHIP_X", 200_000.0, USERNAME)).thenReturn(coupon);
            request.setDiscountCouponCode("FREESHIP_X");

            assertThatThrownBy(() -> orderService.createOrder(USERNAME, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Lỗi áp dụng mã giảm giá");

            verify(orderRepository, never()).save(any(Order.class));
        }

        @Test
        @DisplayName("Áp mã miễn phí vận chuyển, giảm tối đa bằng đúng phí vận chuyển")
        void createOrder_maVanChuyen_khongVuotPhiShip() {
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();

            Coupon coupon = taoCoupon("FREESHIP_50K", "SHIPPING");
            when(couponService.validateCoupon("FREESHIP_50K", 200_000.0, USERNAME)).thenReturn(coupon);
            when(couponService.calculateDiscount(coupon, 30_000.0)).thenReturn(50_000.0);
            request.setShippingCouponCode("FREESHIP_50K");

            Order ketQua = orderService.createOrder(USERNAME, request);

            // Mã giảm 50.000 nhưng phí ship chỉ 30.000 -> chỉ giảm được 30.000
            assertThat(ketQua.getShippingCouponCode()).isEqualTo("FREESHIP_50K");
            assertThat(ketQua.getDiscountAmount()).isEqualTo(30_000.0);
            assertThat(ketQua.getTotalAmount()).isEqualTo(200_000.0);
        }

        @Test
        @DisplayName("Ném lỗi khi dùng mã giảm giá sản phẩm vào ô mã vận chuyển")
        void createOrder_maVanChuyenSaiLoai_nemLoi() {
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);

            Coupon coupon = taoCoupon("SALE50", "DISCOUNT");
            when(couponService.validateCoupon("SALE50", 200_000.0, USERNAME)).thenReturn(coupon);
            request.setShippingCouponCode("SALE50");

            assertThatThrownBy(() -> orderService.createOrder(USERNAME, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Lỗi áp dụng mã vận chuyển");
        }

        @Test
        @DisplayName("Mã rỗng hoặc chỉ chứa khoảng trắng thì bỏ qua, không gọi kiểm tra mã")
        void createOrder_maRong_boQua() {
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();
            request.setDiscountCouponCode("   ");
            request.setShippingCouponCode("");

            Order ketQua = orderService.createOrder(USERNAME, request);

            assertThat(ketQua.getTotalAmount()).isEqualTo(230_000.0);
            verifyNoInteractions(couponService);
        }
    }

    // ==================== KHẤU TRỪ Y-POINT ====================
    @Nested
    @DisplayName("Khấu trừ điểm Y-Point")
    class YPointTests {

        @Test
        @DisplayName("Dùng điểm hợp lệ: trừ đúng số điểm và giảm đúng số tiền")
        void createOrder_dungDiemHopLe() {
            user.setYPoints(50_000);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();
            request.setSpentPoints(50_000);

            Order ketQua = orderService.createOrder(USERNAME, request);

            assertThat(ketQua.getPointsUsed()).isEqualTo(50_000);
            assertThat(ketQua.getTotalAmount()).isEqualTo(180_000.0);
            assertThat(user.getYPoints()).isZero();
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Ghi giao dịch SPEND_ORDER với giá trị âm khi dùng điểm")
        void createOrder_dungDiem_ghiGiaoDich() {
            user.setYPoints(50_000);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();
            request.setSpentPoints(50_000);

            orderService.createOrder(USERNAME, request);

            ArgumentCaptor<PointTransaction> captor = ArgumentCaptor.forClass(PointTransaction.class);
            verify(pointTransactionRepository).save(captor.capture());
            PointTransaction tx = captor.getValue();

            assertThat(tx.getAction()).isEqualTo("SPEND_ORDER");
            assertThat(tx.getPreviousBalance()).isEqualTo(50_000);
            assertThat(tx.getTransactionValue()).isEqualTo(-50_000);
            assertThat(tx.getNewBalance()).isZero();
        }

        @Test
        @DisplayName("Ném lỗi khi số điểm muốn dùng vượt quá số điểm đang có")
        void createOrder_khongDuDiem_nemLoi() {
            user.setYPoints(1_000);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            request.setSpentPoints(5_000);

            assertThatThrownBy(() -> orderService.createOrder(USERNAME, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Bạn không đủ Y-Point để thanh toán!");

            verify(orderRepository, never()).save(any(Order.class));
            verifyNoInteractions(pointTransactionRepository);
        }

        @Test
        @DisplayName("Số điểm dùng bị cắt xuống bằng phần trần giảm giá còn lại")
        void createOrder_diemVuotTran_biCat() {
            user.setYPoints(200_000);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();
            request.setSpentPoints(150_000);

            Order ketQua = orderService.createOrder(USERNAME, request);

            // Trần giảm tối đa 100.000 -> chỉ dùng được 100.000 điểm
            assertThat(ketQua.getPointsUsed()).isEqualTo(100_000);
            assertThat(ketQua.getTotalAmount()).isEqualTo(130_000.0);
            assertThat(user.getYPoints()).isEqualTo(100_000);
        }

        @Test
        @DisplayName("Không dùng điểm thì không trừ điểm và không ghi giao dịch")
        void createOrder_khongDungDiem_khongGhiGiaoDich() {
            user.setYPoints(50_000);
            gaLapLuongCoBan();
            taoSach(10L, 100_000, 100_000.0, 10, 0);
            themDongHang(10L, 2, 100_000.0);
            gaLapSaveOrder();
            request.setSpentPoints(0);

            Order ketQua = orderService.createOrder(USERNAME, request);

            assertThat(ketQua.getPointsUsed()).isZero();
            assertThat(user.getYPoints()).isEqualTo(50_000);
            verifyNoInteractions(pointTransactionRepository);
        }
    }
}