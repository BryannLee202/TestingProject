package com.bookstore.service;

import com.bookstore.dto.ChangePasswordRequest;
import com.bookstore.dto.ProfileUpdateRequest;
import com.bookstore.entity.AuthProvider;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit test cho UserService.
 *
 * Phạm vi kiểm thử:
 *  - Lấy thông tin tài khoản theo tên đăng nhập
 *  - Cập nhật hồ sơ cá nhân, bao gồm trường huấn luyện AI
 *  - Đổi mật khẩu: xác thực mật khẩu cũ, mã hoá mật khẩu mới,
 *    chặn tài khoản đăng nhập qua mạng xã hội
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService - Unit Test")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private static final String USERNAME = "nguyenvana";

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username(USERNAME)
                .email("a@example.com")
                .password("mat-khau-da-ma-hoa")
                .fullName("Nguyen Van A")
                .phone("0900000000")
                .gender("Nam")
                .birthday("01/01/2000")
                .role(Role.USER)
                .provider(AuthProvider.LOCAL)
                .build();
    }

    /** Lấy một giá trị AuthProvider khác LOCAL để kiểm thử tài khoản mạng xã hội. */
    private AuthProvider layProviderMangXaHoi() {
        return Arrays.stream(AuthProvider.values())
                .filter(p -> p != AuthProvider.LOCAL)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Cần ít nhất một AuthProvider khác LOCAL"));
    }

    /** Cho userRepository.save() trả lại chính đối tượng được truyền vào. */
    private void gaLapSaveUser() {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    // ==================== LẤY THÔNG TIN TÀI KHOẢN ====================
    @Nested
    @DisplayName("getUserByUsername()")
    class LayThongTinTests {

        @Test
        @DisplayName("Trả về đúng tài khoản khi tồn tại")
        void getUserByUsername_tonTai_traVeUser() {
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));

            User ketQua = userService.getUserByUsername(USERNAME);

            assertThat(ketQua).isSameAs(user);
            assertThat(ketQua.getUsername()).isEqualTo(USERNAME);
        }

        @Test
        @DisplayName("Ném lỗi khi tài khoản không tồn tại")
        void getUserByUsername_khongTonTai_nemLoi() {
            when(userRepository.findByUsername("khongcothat")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserByUsername("khongcothat"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy người dùng!");
        }
    }

    // ==================== CẬP NHẬT HỒ SƠ ====================
    @Nested
    @DisplayName("updateProfile()")
    class CapNhatHoSoTests {

        @Test
        @DisplayName("Cập nhật đầy đủ thông tin cá nhân")
        void updateProfile_capNhatDayDu() {
            ProfileUpdateRequest request = mock(ProfileUpdateRequest.class);
            when(request.getFullName()).thenReturn("Nguyen Van A Updated");
            when(request.getPhone()).thenReturn("0911111111");
            when(request.getGender()).thenReturn("Nữ");
            when(request.getBirthday()).thenReturn("02/02/1999");

            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            gaLapSaveUser();

            User ketQua = userService.updateProfile(USERNAME, request);

            assertThat(ketQua.getFullName()).isEqualTo("Nguyen Van A Updated");
            assertThat(ketQua.getPhone()).isEqualTo("0911111111");
            assertThat(ketQua.getGender()).isEqualTo("Nữ");
            assertThat(ketQua.getBirthday()).isEqualTo("02/02/1999");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Cập nhật nội dung huấn luyện AI khi được truyền vào")
        void updateProfile_coAiPreferences_capNhat() {
            ProfileUpdateRequest request = mock(ProfileUpdateRequest.class);
            when(request.getAiPreferences()).thenReturn("Xưng hô thân mật, thích sách trinh thám");

            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            gaLapSaveUser();

            User ketQua = userService.updateProfile(USERNAME, request);

            assertThat(ketQua.getAiPreferences()).isEqualTo("Xưng hô thân mật, thích sách trinh thám");
        }

        @Test
        @DisplayName("Không truyền huấn luyện AI thì giữ nguyên nội dung cũ")
        void updateProfile_aiPreferencesNull_giuNguyen() {
            user.setAiPreferences("Nội dung đã lưu trước đó");

            ProfileUpdateRequest request = mock(ProfileUpdateRequest.class);
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            gaLapSaveUser();

            User ketQua = userService.updateProfile(USERNAME, request);

            assertThat(ketQua.getAiPreferences()).isEqualTo("Nội dung đã lưu trước đó");
        }

        @Test
        @DisplayName("Trường bỏ trống bị ghi đè thành null, làm mất dữ liệu cũ")
        void updateProfile_truongBoTrong_ghiDeThanhNull() {
            ProfileUpdateRequest request = mock(ProfileUpdateRequest.class);
            when(request.getFullName()).thenReturn("Nguyen Van A");

            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            gaLapSaveUser();

            User ketQua = userService.updateProfile(USERNAME, request);

            // Chốt lại hành vi hiện tại: không truyền phone/gender/birthday
            // thì dữ liệu cũ bị xoá sạch thay vì được giữ lại
            assertThat(ketQua.getFullName()).isEqualTo("Nguyen Van A");
            assertThat(ketQua.getPhone()).isNull();
            assertThat(ketQua.getGender()).isNull();
            assertThat(ketQua.getBirthday()).isNull();
        }

        @Test
        @DisplayName("Ném lỗi khi tài khoản không tồn tại")
        void updateProfile_userKhongTonTai_nemLoi() {
            ProfileUpdateRequest request = mock(ProfileUpdateRequest.class);
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateProfile(USERNAME, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy tài khoản!");

            verify(userRepository, never()).save(any(User.class));
        }
    }

    // ==================== ĐỔI MẬT KHẨU ====================
    @Nested
    @DisplayName("changePassword()")
    class DoiMatKhauTests {

        @Test
        @DisplayName("Đổi mật khẩu thành công: mật khẩu mới được mã hoá trước khi lưu")
        void changePassword_thanhCong_maHoaMatKhauMoi() {
            ChangePasswordRequest request = mock(ChangePasswordRequest.class);
            when(request.getOldPassword()).thenReturn("matkhaucu");
            when(request.getNewPassword()).thenReturn("matkhaumoi");

            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("matkhaucu", "mat-khau-da-ma-hoa")).thenReturn(true);
            when(passwordEncoder.encode("matkhaumoi")).thenReturn("mat-khau-moi-da-ma-hoa");

            userService.changePassword(USERNAME, request);

            assertThat(user.getPassword()).isEqualTo("mat-khau-moi-da-ma-hoa");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Ném lỗi khi mật khẩu cũ không chính xác")
        void changePassword_matKhauCuSai_nemLoi() {
            ChangePasswordRequest request = mock(ChangePasswordRequest.class);
            when(request.getOldPassword()).thenReturn("matkhausai");

            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("matkhausai", "mat-khau-da-ma-hoa")).thenReturn(false);

            assertThatThrownBy(() -> userService.changePassword(USERNAME, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Mật khẩu cũ không chính xác!");

            assertThat(user.getPassword()).isEqualTo("mat-khau-da-ma-hoa");
            verify(userRepository, never()).save(any(User.class));
            verify(passwordEncoder, never()).encode(anyString());
        }

        @Test
        @DisplayName("Chặn đổi mật khẩu với tài khoản đăng nhập qua mạng xã hội")
        void changePassword_taiKhoanMangXaHoi_nemLoi() {
            user.setProvider(layProviderMangXaHoi());

            ChangePasswordRequest request = mock(ChangePasswordRequest.class);
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> userService.changePassword(USERNAME, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Mạng xã hội");

            // Không kiểm tra mật khẩu cũ vì đã bị chặn từ trước
            verifyNoInteractions(passwordEncoder);
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Ném lỗi khi tài khoản không tồn tại")
        void changePassword_userKhongTonTai_nemLoi() {
            ChangePasswordRequest request = mock(ChangePasswordRequest.class);
            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.changePassword(USERNAME, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy tài khoản!");

            verifyNoInteractions(passwordEncoder);
        }

        @Test
        @DisplayName("Cho phép đặt mật khẩu mới trùng với mật khẩu cũ")
        void changePassword_matKhauMoiTrungCu_vanChoPhep() {
            ChangePasswordRequest request = mock(ChangePasswordRequest.class);
            when(request.getOldPassword()).thenReturn("matkhaucu");
            when(request.getNewPassword()).thenReturn("matkhaucu");

            when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("matkhaucu", "mat-khau-da-ma-hoa")).thenReturn(true);
            when(passwordEncoder.encode("matkhaucu")).thenReturn("mat-khau-da-ma-hoa-lai");

            userService.changePassword(USERNAME, request);

            // Chốt lại hành vi hiện tại: hệ thống không chặn việc đặt lại mật khẩu cũ
            verify(userRepository).save(user);
        }
    }
}