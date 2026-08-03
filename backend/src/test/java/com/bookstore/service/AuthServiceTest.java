package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.entity.*;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.PointTransactionRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit test cho AuthService.
 * Mock toàn bộ dependency (UserRepository, PasswordEncoder, JwtService,
 * AuthenticationManager, CouponRepository, PointTransactionRepository)
 * để test cô lập logic nghiệp vụ bên trong AuthService, không đụng DB thật.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService - Unit Test")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private PointTransactionRepository pointTransactionRepository;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private AuthRequest authRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("Nguyen Van A");
        registerRequest.setEmail("a@example.com");
        registerRequest.setPhone("0900000000");
        registerRequest.setPassword("123456");

        authRequest = new AuthRequest();
        authRequest.setEmail("a@example.com");
        authRequest.setPassword("123456");
    }

    // ================= REGISTER =================
    @Nested
    @DisplayName("register()")
    class RegisterTests {

        @Test
        @DisplayName("Đăng ký thành công khi email và phone chưa tồn tại")
        void register_success() {
            when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
            when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(false);
            when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encoded-password");
            when(jwtService.generateToken(any(User.class))).thenReturn("fake-jwt-token");

            // Giả lập userRepository.save gán id cho user (JPA thường tự set id sau save)
            doAnswer(invocation -> {
                User u = invocation.getArgument(0);
                if (u.getId() == null) {
                    u.setId(1L);
                }
                return u;
            }).when(userRepository).save(any(User.class));

            AuthResponse response = authService.register(registerRequest);

            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo("fake-jwt-token");
            assertThat(response.getUser().getEmail()).isEqualTo(registerRequest.getEmail());
            assertThat(response.getUser().getRole()).isEqualTo(Role.USER);
            assertThat(response.getUser().getProvider()).isEqualTo(AuthProvider.LOCAL);

            // userRepository.save được gọi 2 lần: 1 lần tạo user, 1 lần trong applyRegistrationGift
            verify(userRepository, times(2)).save(any(User.class));
        }

        @Test
        @DisplayName("Ném lỗi khi email đã tồn tại")
        void register_emailExists_throwsException() {
            when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

            assertThatThrownBy(() -> authService.register(registerRequest))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Email đã được sử dụng!");

            verify(userRepository, never()).save(any(User.class));
            verifyNoInteractions(jwtService);
        }

        @Test
        @DisplayName("Ném lỗi khi số điện thoại đã tồn tại")
        void register_phoneExists_throwsException() {
            when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
            when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(true);

            assertThatThrownBy(() -> authService.register(registerRequest))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Số điện thoại đã được sử dụng!");

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Không kiểm tra trùng phone khi phone null")
        void register_phoneNull_skipsPhoneCheck() {
            registerRequest.setPhone(null);
            when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
            when(jwtService.generateToken(any(User.class))).thenReturn("fake-jwt-token");

            authService.register(registerRequest);

            verify(userRepository, never()).existsByPhone(anyString());
        }

        @Test
        @DisplayName("Mật khẩu phải được mã hoá trước khi lưu")
        void register_passwordIsEncoded() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByPhone(anyString())).thenReturn(false);
            when(passwordEncoder.encode("123456")).thenReturn("hashed-123456");
            when(jwtService.generateToken(any(User.class))).thenReturn("fake-jwt-token");

            authService.register(registerRequest);

            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository, atLeastOnce()).save(captor.capture());
            assertThat(captor.getAllValues().get(0).getPassword()).isEqualTo("hashed-123456");
        }

        @Test
        @DisplayName("Tặng quà đăng ký: cộng đúng 20000 điểm Y-Points và tích luỹ")
        void register_appliesRegistrationGift_points() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByPhone(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
            when(jwtService.generateToken(any(User.class))).thenReturn("fake-jwt-token");

            authService.register(registerRequest);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository, times(2)).save(userCaptor.capture());
            User savedUserWithGift = userCaptor.getAllValues().get(1);

            assertThat(savedUserWithGift.getYPoints()).isEqualTo(20000);
            assertThat(savedUserWithGift.getAccumulatedPoints()).isEqualTo(20000);
        }

        @Test
        @DisplayName("Tặng quà đăng ký: ghi lại lịch sử giao dịch điểm REGISTER_GIFT")
        void register_appliesRegistrationGift_pointTransaction() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByPhone(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
            when(jwtService.generateToken(any(User.class))).thenReturn("fake-jwt-token");

            authService.register(registerRequest);

            ArgumentCaptor<PointTransaction> txCaptor = ArgumentCaptor.forClass(PointTransaction.class);
            verify(pointTransactionRepository).save(txCaptor.capture());

            PointTransaction tx = txCaptor.getValue();
            assertThat(tx.getAction()).isEqualTo("REGISTER_GIFT");
            assertThat(tx.getPreviousBalance()).isEqualTo(0);
            assertThat(tx.getTransactionValue()).isEqualTo(20000);
            assertThat(tx.getNewBalance()).isEqualTo(20000);
        }

        @Test
        @DisplayName("Tặng quà đăng ký: tạo coupon FREESHIP đúng giá trị và hạn dùng")
        void register_appliesRegistrationGift_freeshipCoupon() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByPhone(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
            when(jwtService.generateToken(any(User.class))).thenReturn("fake-jwt-token");

            authService.register(registerRequest);

            ArgumentCaptor<Coupon> couponCaptor = ArgumentCaptor.forClass(Coupon.class);
            verify(couponRepository).save(couponCaptor.capture());

            Coupon coupon = couponCaptor.getValue();
            assertThat(coupon.getCode()).startsWith("FREESHIP_");
            assertThat(coupon.getDiscountType()).isEqualTo(DiscountType.FIXED);
            assertThat(coupon.getDiscountValue()).isEqualTo(30000.0);
            assertThat(coupon.getCategory()).isEqualTo("SHIPPING");
            assertThat(coupon.getUsageLimit()).isEqualTo(1);
            assertThat(coupon.getIsActive()).isTrue();
            assertThat(coupon.getIsPartner()).isFalse();
            assertThat(coupon.getExpirationDate()).isAfter(java.time.LocalDateTime.now());
        }

        @Test
        @DisplayName("Token JWT được sinh ra dựa trên user vừa tạo")
        void register_generatesJwtForNewUser() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByPhone(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
            when(jwtService.generateToken(any(User.class))).thenReturn("fake-jwt-token");

            AuthResponse response = authService.register(registerRequest);

            verify(jwtService).generateToken(any(User.class));
            assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        }
    }

    // ================= LOGIN =================
    @Nested
    @DisplayName("login()")
    class LoginTests {

        @Test
        @DisplayName("Đăng nhập thành công trả về token và thông tin user")
        void login_success() {
            User existingUser = User.builder()
                    .id(1L)
                    .email("a@example.com")
                    .fullName("Nguyen Van A")
                    .role(Role.USER)
                    .build();

            when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.of(existingUser));
            when(jwtService.generateToken(existingUser)).thenReturn("fake-jwt-token");

            AuthResponse response = authService.login(authRequest);

            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo("fake-jwt-token");
            assertThat(response.getUser().getEmail()).isEqualTo("a@example.com");
            verify(authenticationManager).authenticate(any());
        }

        @Test
        @DisplayName("Ném lỗi khi email hoặc mật khẩu sai (AuthenticationManager throw)")
        void login_wrongCredentials_throwsException() {
            when(authenticationManager.authenticate(any()))
                    .thenThrow(new BadCredentialsException("Sai email hoặc mật khẩu"));

            assertThatThrownBy(() -> authService.login(authRequest))
                    .isInstanceOf(BadCredentialsException.class);

            verifyNoInteractions(jwtService);
        }

        @Test
        @DisplayName("Ném lỗi khi user không tồn tại trong DB dù xác thực qua (trường hợp hiếm)")
        void login_userNotFoundAfterAuth_throwsException() {
            when(userRepository.findByEmail("a@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(authRequest))
                    .isInstanceOf(java.util.NoSuchElementException.class);
        }
    }
}