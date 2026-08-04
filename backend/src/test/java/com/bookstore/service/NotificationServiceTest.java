package com.bookstore.service;

import com.bookstore.entity.Notification;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.NotificationRepository;
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
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

/**
 * Unit test cho NotificationService.
 *
 * Phạm vi kiểm thử:
 *  - Lấy thông báo cho khách vãng lai và cho người dùng đã đăng nhập
 *  - Đếm số thông báo chưa đọc
 *  - Tạo thông báo với thời điểm mặc định
 *  - Đánh dấu đã đọc một thông báo và đánh dấu hàng loạt
 *
 * Chú ý: thông báo có userId bằng null là thông báo phát chung (broadcast)
 * cho mọi người dùng, thông báo có userId là thông báo riêng.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService - Unit Test")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private static final String USERNAME = "nguyenvana";
    private static final Long USER_ID = 1L;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(USER_ID)
                .username(USERNAME)
                .email("a@example.com")
                .fullName("Nguyen Van A")
                .role(Role.USER)
                .build();
    }

    /** Tạo một thông báo phục vụ kiểm thử. */
    private Notification taoThongBao(Long userId, boolean daDoc) {
        return Notification.builder()
                .title("Tiêu đề thông báo")
                .content("Nội dung thông báo")
                .type("SYSTEM")
                .userId(userId)
                .isRead(daDoc)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ==================== LẤY DANH SÁCH THÔNG BÁO ====================
    @Nested
    @DisplayName("getNotificationsByUser()")
    class LayThongBaoTests {

        @Test
        @DisplayName("Người dùng đã đăng nhập: lấy cả thông báo riêng và thông báo chung")
        void getNotifications_daDangNhap_layCaRiengVaChung() {
            Notification rieng = taoThongBao(USER_ID, false);
            Notification chung = taoThongBao(null, false);
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(Arrays.asList(rieng, chung));

            List<Notification> ketQua = notificationService.getNotificationsByUser(USERNAME);

            assertThat(ketQua).containsExactly(rieng, chung);
        }

        @Test
        @DisplayName("Tên đăng nhập null: chỉ lấy thông báo chung")
        void getNotifications_usernameNull_chiLayChung() {
            Notification chung = taoThongBao(null, false);
            when(notificationRepository.findByUserIdIsNullOrderByCreatedAtDesc())
                    .thenReturn(List.of(chung));

            List<Notification> ketQua = notificationService.getNotificationsByUser(null);

            assertThat(ketQua).containsExactly(chung);
            verifyNoInteractions(userRepository);
        }

        @Test
        @DisplayName("Khách vãng lai (anonymousUser): chỉ lấy thông báo chung")
        void getNotifications_khachVangLai_chiLayChung() {
            when(notificationRepository.findByUserIdIsNullOrderByCreatedAtDesc())
                    .thenReturn(List.of(taoThongBao(null, false)));

            List<Notification> ketQua = notificationService.getNotificationsByUser("anonymousUser");

            assertThat(ketQua).hasSize(1);
            verifyNoInteractions(userRepository);
        }

        @Test
        @DisplayName("Tên đăng nhập rỗng: chỉ lấy thông báo chung")
        void getNotifications_usernameRong_chiLayChung() {
            when(notificationRepository.findByUserIdIsNullOrderByCreatedAtDesc())
                    .thenReturn(List.of(taoThongBao(null, false)));

            List<Notification> ketQua = notificationService.getNotificationsByUser("");

            assertThat(ketQua).hasSize(1);
            verifyNoInteractions(userRepository);
        }

        @Test
        @DisplayName("Tài khoản không tồn tại trong hệ thống: trả về thông báo chung, không ném lỗi")
        void getNotifications_userKhongTonTai_traVeChung() {
            when(userRepository.findByUsername("khongcothat")).thenReturn(Optional.empty());
            when(notificationRepository.findByUserIdIsNullOrderByCreatedAtDesc())
                    .thenReturn(List.of(taoThongBao(null, false)));

            List<Notification> ketQua = notificationService.getNotificationsByUser("khongcothat");

            assertThat(ketQua).hasSize(1);
        }
    }

    // ==================== ĐẾM THÔNG BÁO CHƯA ĐỌC ====================
    @Nested
    @DisplayName("getUnreadCount()")
    class DemChuaDocTests {

        @Test
        @DisplayName("Trả về đúng số thông báo riêng chưa đọc")
        void getUnreadCount_daDangNhap_traVeDungSo() {
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(notificationRepository.countByUserIdAndIsReadFalse(USER_ID)).thenReturn(5L);

            assertThat(notificationService.getUnreadCount(USERNAME)).isEqualTo(5L);
        }

        @Test
        @DisplayName("Tên đăng nhập null: trả về 0")
        void getUnreadCount_usernameNull_traVeKhong() {
            assertThat(notificationService.getUnreadCount(null)).isZero();

            verifyNoInteractions(userRepository, notificationRepository);
        }

        @Test
        @DisplayName("Khách vãng lai: trả về 0")
        void getUnreadCount_khachVangLai_traVeKhong() {
            assertThat(notificationService.getUnreadCount("anonymousUser")).isZero();

            verifyNoInteractions(userRepository, notificationRepository);
        }

        @Test
        @DisplayName("Tên đăng nhập rỗng: trả về 0")
        void getUnreadCount_usernameRong_traVeKhong() {
            assertThat(notificationService.getUnreadCount("")).isZero();

            verifyNoInteractions(userRepository, notificationRepository);
        }

        @Test
        @DisplayName("Tài khoản không tồn tại: trả về 0, không ném lỗi")
        void getUnreadCount_userKhongTonTai_traVeKhong() {
            when(userRepository.findByUsername("khongcothat")).thenReturn(Optional.empty());

            assertThat(notificationService.getUnreadCount("khongcothat")).isZero();

            verifyNoInteractions(notificationRepository);
        }
    }

    // ==================== TẠO THÔNG BÁO ====================
    @Nested
    @DisplayName("createNotification()")
    class TaoThongBaoTests {

        @Test
        @DisplayName("Không truyền thời điểm tạo: hệ thống tự gán thời điểm hiện tại")
        void createNotification_khongCoThoiDiem_tuGan() {
            Notification thongBao = Notification.builder()
                    .title("Tiêu đề")
                    .content("Nội dung")
                    .type("SYSTEM")
                    .isRead(false)
                    .build();
            thongBao.setCreatedAt(null);
            when(notificationRepository.save(any(Notification.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            Notification ketQua = notificationService.createNotification(thongBao);

            assertThat(ketQua.getCreatedAt()).isNotNull();
        }

        @Test
        @DisplayName("Đã có thời điểm tạo: giữ nguyên, không ghi đè")
        void createNotification_daCoThoiDiem_giuNguyen() {
            LocalDateTime thoiDiemCu = LocalDateTime.of(2026, 1, 1, 10, 0);
            Notification thongBao = taoThongBao(USER_ID, false);
            thongBao.setCreatedAt(thoiDiemCu);
            when(notificationRepository.save(any(Notification.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            Notification ketQua = notificationService.createNotification(thongBao);

            assertThat(ketQua.getCreatedAt()).isEqualTo(thoiDiemCu);
        }
    }

    // ==================== ĐÁNH DẤU ĐÃ ĐỌC ====================
    @Nested
    @DisplayName("Đánh dấu đã đọc")
    class DanhDauDaDocTests {

        @Test
        @DisplayName("markAsRead đánh dấu đúng thông báo là đã đọc")
        void markAsRead_thanhCong() {
            Notification thongBao = taoThongBao(USER_ID, false);
            when(notificationRepository.findById(1L)).thenReturn(Optional.of(thongBao));
            when(notificationRepository.save(thongBao)).thenReturn(thongBao);

            Notification ketQua = notificationService.markAsRead(1L);

            assertThat(ketQua.getIsRead()).isTrue();
        }

        @Test
        @DisplayName("markAsRead ném lỗi khi thông báo không tồn tại")
        void markAsRead_khongTonTai_nemLoi() {
            when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> notificationService.markAsRead(99L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy thông báo!");
        }

        @Test
        @DisplayName("markAllAsRead chỉ đánh dấu thông báo riêng, bỏ qua thông báo chung")
        void markAllAsRead_chiDanhDauThongBaoRieng() {
            Notification rieng = taoThongBao(USER_ID, false);
            Notification chung = taoThongBao(null, false);
            Notification cuaNguoiKhac = taoThongBao(2L, false);

            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(Arrays.asList(rieng, chung, cuaNguoiKhac));

            notificationService.markAllAsRead(USERNAME);

            assertThat(rieng.getIsRead()).isTrue();
            assertThat(chung.getIsRead()).isFalse();
            assertThat(cuaNguoiKhac.getIsRead()).isFalse();
            verify(notificationRepository).saveAll(anyList());
        }

        @Test
        @DisplayName("markAllAsRead không làm gì khi tài khoản không tồn tại")
        void markAllAsRead_userKhongTonTai_khongLamGi() {
            when(userRepository.findByUsername("khongcothat")).thenReturn(Optional.empty());

            notificationService.markAllAsRead("khongcothat");

            verifyNoInteractions(notificationRepository);
        }

        @Test
        @DisplayName("markAllAsRead không lỗi khi người dùng chưa có thông báo nào")
        void markAllAsRead_khongCoThongBao_khongLoi() {
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(List.of());

            notificationService.markAllAsRead(USERNAME);

            verify(notificationRepository).saveAll(anyList());
        }
    }
}