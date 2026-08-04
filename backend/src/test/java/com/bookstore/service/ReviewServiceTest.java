package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Notification;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.PointTransaction;
import com.bookstore.entity.Review;
import com.bookstore.entity.ReviewComment;
import com.bookstore.entity.Role;
import com.bookstore.entity.ShippingStatus;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.NotificationRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.PointTransactionRepository;
import com.bookstore.repository.ReviewCommentRepository;
import com.bookstore.repository.ReviewRepository;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit test cho ReviewService.
 *
 * Phạm vi kiểm thử:
 *  - Luật nghiệp vụ "phải mua và nhận hàng thành công mới được đánh giá"
 *  - Giới hạn số lượt đánh giá không vượt quá số lần mua
 *  - Kiểm tra hợp lệ số sao (1..5) với các giá trị biên
 *  - Tính lại điểm trung bình khi thêm, sửa, xoá đánh giá
 *  - Cộng điểm thưởng Y-Point khi đánh giá
 *  - Thích/bỏ thích, bình luận kèm thông báo, báo cáo vi phạm
 *  - Job tự động đánh giá đơn hàng quá 7 ngày
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ReviewService - Unit Test")
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private PointTransactionRepository pointTransactionRepository;

    @Mock
    private ReviewCommentRepository reviewCommentRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ReviewService reviewService;

    private static final String USERNAME = "nguyenvana";
    private static final Long BOOK_ID = 10L;

    private User user;
    private Book book;

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

        book = Book.builder()
                .id(BOOK_ID)
                .title("Nhà Giả Kim")
                .price(BigDecimal.valueOf(100000))
                .stockQuantity(10)
                .reviewCount(0)
                .averageRating(0.0)
                .build();
    }

    /** Khai báo số lần mua đã nhận hàng và số lượt đã đánh giá. */
    private void gaLapSoLanMuaVaDanhGia(long soLanMua, long soLuotDanhGia) {
        when(orderRepository.countUserDeliveredPurchases(user, book, ShippingStatus.DELIVERED))
                .thenReturn(soLanMua);
        if (soLanMua > 0) {
            when(reviewRepository.countByUserIdAndBookId(1L, BOOK_ID)).thenReturn(soLuotDanhGia);
        }
    }

    /** Khai báo tìm thấy user và sách. */
    private void gaLapTimThayUserVaSach() {
        when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
        when(bookRepository.findById(BOOK_ID)).thenReturn(Optional.of(book));
    }

    /** Cho reviewRepository.save() trả lại chính đối tượng được truyền vào. */
    private void gaLapSaveReview() {
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    /** Tạo một đánh giá đã tồn tại trong hệ thống. */
    private Review taoDanhGia(int soSao, String noiDung) {
        return Review.builder()
                .user(user)
                .book(book)
                .rating(soSao)
                .comment(noiDung)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ==================== ĐIỀU KIỆN ĐƯỢC ĐÁNH GIÁ ====================
    @Nested
    @DisplayName("Điều kiện được đánh giá")
    class DieuKienDanhGiaTests {

        @Test
        @DisplayName("Ném lỗi khi chưa từng mua và nhận hàng thành công")
        void createReview_chuaMuaHang_nemLoi() {
            gaLapTimThayUserVaSach();
            when(orderRepository.countUserDeliveredPurchases(user, book, ShippingStatus.DELIVERED))
                    .thenReturn(0L);

            assertThatThrownBy(() -> reviewService.createReview(USERNAME, BOOK_ID, 5, "Sách hay", null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("cần mua và nhận hàng thành công");

            verify(reviewRepository, never()).save(any(Review.class));
        }

        @Test
        @DisplayName("Ném lỗi khi số lượt đánh giá đã bằng số lần mua")
        void createReview_daDanhGiaDuSoLan_nemLoi() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(2, 2);

            assertThatThrownBy(() -> reviewService.createReview(USERNAME, BOOK_ID, 5, "Sách hay", null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("đã đạt giới hạn");

            verify(reviewRepository, never()).save(any(Review.class));
        }

        @Test
        @DisplayName("Mua 2 lần mới đánh giá 1 lần thì vẫn được đánh giá tiếp")
        void createReview_muaNhieuHonSoLuotDanhGia_thanhCong() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(2, 1);
            gaLapSaveReview();

            Review ketQua = reviewService.createReview(USERNAME, BOOK_ID, 5, "Sách hay", null);

            assertThat(ketQua).isNotNull();
            assertThat(ketQua.getRating()).isEqualTo(5);
            verify(reviewRepository).save(any(Review.class));
        }

        @Test
        @DisplayName("Ném lỗi khi không tìm thấy người dùng")
        void createReview_userKhongTonTai_nemLoi() {
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reviewService.createReview(USERNAME, BOOK_ID, 5, "Sách hay", null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy người dùng!");
        }

        @Test
        @DisplayName("Ném lỗi khi không tìm thấy sách")
        void createReview_sachKhongTonTai_nemLoi() {
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(bookRepository.findById(BOOK_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reviewService.createReview(USERNAME, BOOK_ID, 5, "Sách hay", null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy sách!");
        }
    }

    // ==================== GIÁ TRỊ BIÊN SỐ SAO ====================
    @Nested
    @DisplayName("Kiểm tra số sao hợp lệ")
    class SoSaoTests {

        @Test
        @DisplayName("Giá trị biên dưới: 1 sao là hợp lệ")
        void createReview_motSao_hopLe() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);
            gaLapSaveReview();

            Review ketQua = reviewService.createReview(USERNAME, BOOK_ID, 1, null, null);

            assertThat(ketQua.getRating()).isEqualTo(1);
        }

        @Test
        @DisplayName("Giá trị biên trên: 5 sao là hợp lệ")
        void createReview_namSao_hopLe() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);
            gaLapSaveReview();

            Review ketQua = reviewService.createReview(USERNAME, BOOK_ID, 5, null, null);

            assertThat(ketQua.getRating()).isEqualTo(5);
        }

        @Test
        @DisplayName("Ném lỗi khi đánh giá 0 sao")
        void createReview_khongSao_nemLoi() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);

            assertThatThrownBy(() -> reviewService.createReview(USERNAME, BOOK_ID, 0, null, null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Đánh giá phải từ 1 đến 5 sao!");

            verify(reviewRepository, never()).save(any(Review.class));
        }

        @Test
        @DisplayName("Ném lỗi khi đánh giá 6 sao")
        void createReview_sauSao_nemLoi() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);

            assertThatThrownBy(() -> reviewService.createReview(USERNAME, BOOK_ID, 6, null, null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Đánh giá phải từ 1 đến 5 sao!");
        }

        @Test
        @DisplayName("Ném lỗi khi đánh giá số sao âm")
        void createReview_soSaoAm_nemLoi() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);

            assertThatThrownBy(() -> reviewService.createReview(USERNAME, BOOK_ID, -1, null, null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Đánh giá phải từ 1 đến 5 sao!");
        }
    }

    // ==================== CẬP NHẬT ĐIỂM TRUNG BÌNH ====================
    @Nested
    @DisplayName("Cập nhật điểm trung bình của sách")
    class DiemTrungBinhTests {

        @Test
        @DisplayName("Đánh giá đầu tiên của sách: điểm trung bình bằng đúng số sao")
        void createReview_danhGiaDauTien_diemTrungBinhBangSoSao() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);
            gaLapSaveReview();

            reviewService.createReview(USERNAME, BOOK_ID, 4, null, null);

            assertThat(book.getReviewCount()).isEqualTo(1);
            assertThat(book.getAverageRating()).isEqualTo(4.0);
            verify(bookRepository).save(book);
        }

        @Test
        @DisplayName("Điểm trung bình được tính lại và làm tròn tới 1 chữ số thập phân")
        void createReview_tinhLaiDiemTrungBinh_lamTron1ChuSo() {
            book.setReviewCount(2);
            book.setAverageRating(4.0);
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);
            gaLapSaveReview();

            reviewService.createReview(USERNAME, BOOK_ID, 5, null, null);

            // (4,0 * 2 + 5) / 3 = 4,333... -> làm tròn còn 4,3
            assertThat(book.getReviewCount()).isEqualTo(3);
            assertThat(book.getAverageRating()).isEqualTo(4.3);
        }

        @Test
        @DisplayName("Sách chưa có dữ liệu đánh giá (null) vẫn tính được điểm trung bình")
        void createReview_duLieuDanhGiaNull_khongLoi() {
            book.setReviewCount(null);
            book.setAverageRating(null);
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);
            gaLapSaveReview();

            reviewService.createReview(USERNAME, BOOK_ID, 3, null, null);

            assertThat(book.getReviewCount()).isEqualTo(1);
            assertThat(book.getAverageRating()).isEqualTo(3.0);
        }
    }

    // ==================== ĐIỂM THƯỞNG KHI ĐÁNH GIÁ ====================
    @Nested
    @DisplayName("Điểm thưởng Y-Point khi đánh giá")
    class DiemThuongTests {

        @Test
        @DisplayName("Chỉ chấm sao không viết nhận xét được 200 điểm")
        void createReview_khongCoNhanXet_duoc200Diem() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);
            gaLapSaveReview();

            reviewService.createReview(USERNAME, BOOK_ID, 5, null, null);

            assertThat(user.getYPoints()).isEqualTo(200);
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Chấm sao kèm nhận xét được 400 điểm")
        void createReview_coNhanXet_duoc400Diem() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);
            gaLapSaveReview();

            reviewService.createReview(USERNAME, BOOK_ID, 5, "Sách rất hay, đóng gói cẩn thận", null);

            assertThat(user.getYPoints()).isEqualTo(400);
        }

        @Test
        @DisplayName("Nhận xét chỉ toàn khoảng trắng vẫn chỉ được 200 điểm")
        void createReview_nhanXetToanKhoangTrang_duoc200Diem() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);
            gaLapSaveReview();

            reviewService.createReview(USERNAME, BOOK_ID, 5, "    ", null);

            assertThat(user.getYPoints()).isEqualTo(200);
        }

        @Test
        @DisplayName("Ghi giao dịch điểm EARN_REVIEW kèm tên sách")
        void createReview_ghiGiaoDichDiem() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);
            gaLapSaveReview();

            reviewService.createReview(USERNAME, BOOK_ID, 5, "Sách hay", null);

            ArgumentCaptor<PointTransaction> captor = ArgumentCaptor.forClass(PointTransaction.class);
            verify(pointTransactionRepository).save(captor.capture());
            PointTransaction tx = captor.getValue();

            assertThat(tx.getAction()).isEqualTo("EARN_REVIEW");
            assertThat(tx.getDescription()).contains("Nhà Giả Kim");
            assertThat(tx.getPreviousBalance()).isZero();
            assertThat(tx.getTransactionValue()).isEqualTo(400);
            assertThat(tx.getNewBalance()).isEqualTo(400);
        }

        @Test
        @DisplayName("Tài khoản có số điểm null vẫn cộng điểm được")
        void createReview_diemNull_khongLoi() {
            user.setYPoints(null);
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);
            gaLapSaveReview();

            reviewService.createReview(USERNAME, BOOK_ID, 5, null, null);

            assertThat(user.getYPoints()).isEqualTo(200);
        }
    }

    // ==================== KIỂM TRA ĐIỀU KIỆN ĐÁNH GIÁ ====================
    @Nested
    @DisplayName("getReviewEligibilityReason()")
    class KiemTraDieuKienTests {

        @Test
        @DisplayName("Trả về ELIGIBLE khi đã mua và chưa đánh giá")
        void eligibility_duDieuKien() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 0);

            Map<String, Object> ketQua = reviewService.getReviewEligibilityReason(USERNAME, BOOK_ID);

            assertThat(ketQua).containsEntry("eligible", true).containsEntry("reason", "ELIGIBLE");
        }

        @Test
        @DisplayName("Trả về NOT_BOUGHT khi chưa từng mua")
        void eligibility_chuaMua() {
            gaLapTimThayUserVaSach();
            when(orderRepository.countUserDeliveredPurchases(user, book, ShippingStatus.DELIVERED))
                    .thenReturn(0L);

            Map<String, Object> ketQua = reviewService.getReviewEligibilityReason(USERNAME, BOOK_ID);

            assertThat(ketQua).containsEntry("eligible", false).containsEntry("reason", "NOT_BOUGHT");
        }

        @Test
        @DisplayName("Trả về ALREADY_REVIEWED khi đã đánh giá đủ số lần mua")
        void eligibility_daDanhGia() {
            gaLapTimThayUserVaSach();
            gaLapSoLanMuaVaDanhGia(1, 1);

            Map<String, Object> ketQua = reviewService.getReviewEligibilityReason(USERNAME, BOOK_ID);

            assertThat(ketQua).containsEntry("eligible", false).containsEntry("reason", "ALREADY_REVIEWED");
        }

        @Test
        @DisplayName("Trả về INVALID khi không tìm thấy người dùng")
        void eligibility_userKhongTonTai() {
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());
            when(bookRepository.findById(BOOK_ID)).thenReturn(Optional.of(book));

            Map<String, Object> ketQua = reviewService.getReviewEligibilityReason(USERNAME, BOOK_ID);

            assertThat(ketQua).containsEntry("eligible", false).containsEntry("reason", "INVALID");
        }
    }

    // ==================== SỬA & XOÁ ĐÁNH GIÁ ====================
    @Nested
    @DisplayName("Sửa và xoá đánh giá")
    class SuaXoaTests {

        @Test
        @DisplayName("Xoá đánh giá khi sách còn nhiều đánh giá: tính lại điểm trung bình")
        void deleteReview_conNhieuDanhGia_tinhLaiDiem() {
            book.setReviewCount(3);
            book.setAverageRating(4.0);
            Review review = taoDanhGia(5, "Sách hay");
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

            reviewService.deleteReview(1L);

            // (4,0 * 3 - 5) / 2 = 3,5
            assertThat(book.getReviewCount()).isEqualTo(2);
            assertThat(book.getAverageRating()).isEqualTo(3.5);
            verify(reviewRepository).delete(review);
        }

        @Test
        @DisplayName("Xoá đánh giá cuối cùng: đưa điểm trung bình về 0")
        void deleteReview_danhGiaCuoiCung_veKhong() {
            book.setReviewCount(1);
            book.setAverageRating(5.0);
            Review review = taoDanhGia(5, "Sách hay");
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

            reviewService.deleteReview(1L);

            assertThat(book.getReviewCount()).isZero();
            assertThat(book.getAverageRating()).isEqualTo(0.0);
        }

        @Test
        @DisplayName("Ném lỗi khi xoá đánh giá không tồn tại")
        void deleteReview_khongTonTai_nemLoi() {
            when(reviewRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reviewService.deleteReview(99L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy đánh giá!");
        }

        @Test
        @DisplayName("Sửa số sao: cập nhật lại điểm trung bình của sách")
        void updateReview_doiSoSao_tinhLaiDiem() {
            book.setReviewCount(2);
            book.setAverageRating(4.0);
            Review review = taoDanhGia(3, "Tạm được");
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(reviewRepository.save(review)).thenReturn(review);

            Review ketQua = reviewService.updateReview(1L, null, 5);

            // (4,0 * 2 - 3 + 5) / 2 = 5,0
            assertThat(book.getAverageRating()).isEqualTo(5.0);
            assertThat(ketQua.getRating()).isEqualTo(5);
            verify(bookRepository).save(book);
        }

        @Test
        @DisplayName("Chỉ sửa nội dung nhận xét thì không đụng tới điểm trung bình")
        void updateReview_chiDoiNhanXet_khongDoiDiem() {
            book.setReviewCount(2);
            book.setAverageRating(4.0);
            Review review = taoDanhGia(3, "Tạm được");
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(reviewRepository.save(review)).thenReturn(review);

            Review ketQua = reviewService.updateReview(1L, "Đọc lại thấy hay hơn", null);

            assertThat(ketQua.getComment()).isEqualTo("Đọc lại thấy hay hơn");
            assertThat(book.getAverageRating()).isEqualTo(4.0);
            verifyNoInteractions(bookRepository);
        }

        @Test
        @DisplayName("Sửa lại đúng số sao cũ thì không tính lại điểm trung bình")
        void updateReview_soSaoKhongDoi_khongTinhLai() {
            book.setReviewCount(2);
            book.setAverageRating(4.0);
            Review review = taoDanhGia(3, "Tạm được");
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(reviewRepository.save(review)).thenReturn(review);

            reviewService.updateReview(1L, null, 3);

            assertThat(book.getAverageRating()).isEqualTo(4.0);
            verifyNoInteractions(bookRepository);
        }
    }

    // ==================== THÍCH ĐÁNH GIÁ ====================
    @Nested
    @DisplayName("likeReview()")
    class ThichDanhGiaTests {

        @Test
        @DisplayName("Thích đánh giá lần đầu: tăng số lượt thích lên 1")
        void likeReview_lanDau_tangLuotThich() {
            Review review = taoDanhGia(5, "Sách hay");
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(reviewRepository.save(review)).thenReturn(review);

            Review ketQua = reviewService.likeReview(1L, USERNAME);

            assertThat(ketQua.getLikesCount()).isEqualTo(1);
            assertThat(ketQua.getLikedByUsers()).containsExactly(user);
        }

        @Test
        @DisplayName("Bấm thích lần nữa: bỏ thích và giảm số lượt thích")
        void likeReview_lanHai_boThich() {
            Review review = taoDanhGia(5, "Sách hay");
            review.getLikedByUsers().add(user);
            review.setLikesCount(5);
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(reviewRepository.save(review)).thenReturn(review);

            Review ketQua = reviewService.likeReview(1L, USERNAME);

            assertThat(ketQua.getLikesCount()).isEqualTo(4);
            assertThat(ketQua.getLikedByUsers()).isEmpty();
        }

        @Test
        @DisplayName("Số lượt thích không bao giờ bị âm")
        void likeReview_luotThichKhongAm() {
            Review review = taoDanhGia(5, "Sách hay");
            review.getLikedByUsers().add(user);
            review.setLikesCount(0);
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(reviewRepository.save(review)).thenReturn(review);

            Review ketQua = reviewService.likeReview(1L, USERNAME);

            assertThat(ketQua.getLikesCount()).isZero();
        }

        @Test
        @DisplayName("Ném lỗi khi thích đánh giá không tồn tại")
        void likeReview_danhGiaKhongTonTai_nemLoi() {
            when(reviewRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reviewService.likeReview(99L, USERNAME))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy đánh giá!");
        }
    }

    // ==================== BÌNH LUẬN & THÔNG BÁO ====================
    @Nested
    @DisplayName("addComment()")
    class BinhLuanTests {

        @Test
        @DisplayName("Người khác bình luận: gửi thông báo cho chủ đánh giá")
        void addComment_nguoiKhac_guiThongBao() {
            User nguoiBinhLuan = User.builder()
                    .id(2L)
                    .username("tranvanb")
                    .fullName("Tran Van B")
                    .role(Role.USER)
                    .build();

            Review review = taoDanhGia(5, "Sách hay");
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(userRepository.findByUsername("tranvanb")).thenReturn(Optional.of(nguoiBinhLuan));
            when(reviewCommentRepository.save(any(ReviewComment.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            reviewService.addComment(1L, "tranvanb", "Mình cũng thấy vậy");

            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(captor.capture());
            Notification thongBao = captor.getValue();

            assertThat(thongBao.getType()).isEqualTo("REVIEW_COMMENT");
            assertThat(thongBao.getUserId()).isEqualTo(1L);
            assertThat(thongBao.getContent()).contains("Tran Van B").contains("Mình cũng thấy vậy");
        }

        @Test
        @DisplayName("Tự bình luận trên đánh giá của mình: không gửi thông báo")
        void addComment_tuBinhLuan_khongGuiThongBao() {
            Review review = taoDanhGia(5, "Sách hay");
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(reviewCommentRepository.save(any(ReviewComment.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            reviewService.addComment(1L, USERNAME, "Bổ sung thêm ý");

            verifyNoInteractions(notificationRepository);
        }

        @Test
        @DisplayName("Nội dung bình luận dài bị cắt còn 80 ký tự trong thông báo")
        void addComment_noiDungDai_biCat() {
            User nguoiBinhLuan = User.builder()
                    .id(2L)
                    .username("tranvanb")
                    .fullName("Tran Van B")
                    .role(Role.USER)
                    .build();

            String noiDungDai = "a".repeat(200);
            Review review = taoDanhGia(5, "Sách hay");
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(userRepository.findByUsername("tranvanb")).thenReturn(Optional.of(nguoiBinhLuan));
            when(reviewCommentRepository.save(any(ReviewComment.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            reviewService.addComment(1L, "tranvanb", noiDungDai);

            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(captor.capture());

            assertThat(captor.getValue().getContent()).contains("a".repeat(80)).doesNotContain("a".repeat(81));
        }

        @Test
        @DisplayName("Ném lỗi khi bình luận vào đánh giá không tồn tại")
        void addComment_danhGiaKhongTonTai_nemLoi() {
            when(reviewRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reviewService.addComment(99L, USERNAME, "Nội dung"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy đánh giá!");
        }
    }

    // ==================== BÁO CÁO VI PHẠM ====================
    @Nested
    @DisplayName("Báo cáo vi phạm")
    class BaoCaoTests {

        @Test
        @DisplayName("Báo cáo đánh giá: đánh dấu đã bị báo cáo")
        void reportReview_danhDauBaoCao() {
            Review review = taoDanhGia(1, "Nội dung không phù hợp");
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(reviewRepository.save(review)).thenReturn(review);

            Review ketQua = reviewService.reportReview(1L);

            assertThat(ketQua.getIsReported()).isTrue();
        }

        @Test
        @DisplayName("Bỏ qua báo cáo: gỡ đánh dấu bị báo cáo")
        void dismissReport_goDanhDau() {
            Review review = taoDanhGia(1, "Nội dung bị báo cáo nhầm");
            review.setIsReported(true);
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(reviewRepository.save(review)).thenReturn(review);

            Review ketQua = reviewService.dismissReport(1L);

            assertThat(ketQua.getIsReported()).isFalse();
        }
    }

    // ==================== TRUY VẤN ====================
    @Nested
    @DisplayName("Truy vấn đánh giá")
    class TruyVanTests {

        @Test
        @DisplayName("Lấy danh sách đánh giá theo sách")
        void getReviewsByBookId_traVeDanhSach() {
            Review review = taoDanhGia(5, "Sách hay");
            when(reviewRepository.findByBookIdOrderByCreatedAtDesc(BOOK_ID)).thenReturn(List.of(review));

            assertThat(reviewService.getReviewsByBookId(BOOK_ID)).containsExactly(review);
        }

        @Test
        @DisplayName("Lấy danh sách đánh giá theo người dùng")
        void getReviewsByUsername_traVeDanhSach() {
            Review review = taoDanhGia(5, "Sách hay");
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(reviewRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(review));

            assertThat(reviewService.getReviewsByUsername(USERNAME)).containsExactly(review);
        }

        @Test
        @DisplayName("Ném lỗi khi lấy đánh giá của người dùng không tồn tại")
        void getReviewsByUsername_userKhongTonTai_nemLoi() {
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reviewService.getReviewsByUsername(USERNAME))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy người dùng!");
        }

        @Test
        @DisplayName("Lấy toàn bộ đánh giá cho trang quản trị")
        void getAllReviews_traVeToanBo() {
            Review review = taoDanhGia(5, "Sách hay");
            when(reviewRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(review));

            assertThat(reviewService.getAllReviews()).hasSize(1);
        }

        @Test
        @DisplayName("Lấy danh sách bình luận của một đánh giá")
        void getComments_traVeDanhSach() {
            ReviewComment comment = ReviewComment.builder()
                    .user(user)
                    .content("Đồng ý")
                    .createdAt(LocalDateTime.now())
                    .build();
            when(reviewCommentRepository.findByReviewIdOrderByCreatedAtAsc(1L)).thenReturn(List.of(comment));

            assertThat(reviewService.getComments(1L)).containsExactly(comment);
        }
    }

    // ==================== JOB TỰ ĐỘNG ĐÁNH GIÁ ====================
    @Nested
    @DisplayName("autoReviewUnreviewedOrders()")
    class TuDongDanhGiaTests {

        /** Tạo đơn hàng đã hoàn thành chứa một cuốn sách. */
        private Order taoDonHoanThanh() {
            Order order = Order.builder()
                    .id(1L)
                    .user(user)
                    .status("COMPLETED")
                    .items(new ArrayList<>())
                    .createdAt(LocalDateTime.now().minusDays(10))
                    .build();
            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .book(book)
                    .quantity(1)
                    .build());
            return order;
        }

        @Test
        @DisplayName("Tự động tạo đánh giá 5 sao cho đơn hàng chưa được đánh giá")
        void autoReview_donChuaDanhGia_taoDanhGia() {
            Order order = taoDonHoanThanh();
            when(orderRepository.findByStatusAndCreatedAtBefore(eq("COMPLETED"), any(LocalDateTime.class)))
                    .thenReturn(List.of(order));
            when(orderRepository.countUserDeliveredPurchases(user, book, ShippingStatus.DELIVERED))
                    .thenReturn(1L);
            when(reviewRepository.countByUserIdAndBookId(1L, BOOK_ID)).thenReturn(0L);
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(bookRepository.findById(BOOK_ID)).thenReturn(Optional.of(book));
            gaLapSaveReview();

            reviewService.autoReviewUnreviewedOrders();

            ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
            verify(reviewRepository).save(captor.capture());

            assertThat(captor.getValue().getRating()).isEqualTo(5);
            assertThat(captor.getValue().getComment()).contains("Sản phẩm chất lượng");
        }

        @Test
        @DisplayName("Bỏ qua đơn hàng mà khách đã tự đánh giá")
        void autoReview_daDanhGia_boQua() {
            Order order = taoDonHoanThanh();
            when(orderRepository.findByStatusAndCreatedAtBefore(eq("COMPLETED"), any(LocalDateTime.class)))
                    .thenReturn(List.of(order));
            when(orderRepository.countUserDeliveredPurchases(user, book, ShippingStatus.DELIVERED))
                    .thenReturn(1L);
            when(reviewRepository.countByUserIdAndBookId(1L, BOOK_ID)).thenReturn(1L);

            reviewService.autoReviewUnreviewedOrders();

            verify(reviewRepository, never()).save(any(Review.class));
        }

        @Test
        @DisplayName("Không có đơn hàng nào quá hạn thì không làm gì")
        void autoReview_khongCoDon_khongLamGi() {
            when(orderRepository.findByStatusAndCreatedAtBefore(eq("COMPLETED"), any(LocalDateTime.class)))
                    .thenReturn(new ArrayList<>());

            reviewService.autoReviewUnreviewedOrders();

            verifyNoInteractions(reviewRepository, userRepository, bookRepository);
        }
    }
}