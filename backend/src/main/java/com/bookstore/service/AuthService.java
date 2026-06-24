package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.entity.AuthProvider;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;

    public void sendOtp(String phone, String email) {
        // Nếu không truyền email (ví dụ từ trang Quên mật khẩu), thì tìm user theo số điện thoại để lấy email
        if (email == null || email.isEmpty()) {
            User user = userRepository.findByPhone(phone).orElse(null);
            if (user != null) {
                email = user.getEmail();
            }
        }
        
        if (email == null || email.isEmpty()) {
            // Vẫn gửi OTP, nhưng chỉ in ra console nếu không có email (dự phòng)
        }
        otpService.generateAndSendOtp(phone, email);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng!");
        }
        
        if (request.getFirebaseToken() != null && !request.getFirebaseToken().isEmpty()) {
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getFirebaseToken());
                String verifiedPhone = (String) decodedToken.getClaims().get("phone_number");
                
                // Cập nhật lại số điện thoại chính thức từ Google (bỏ số 0 đầu, thay bằng +84)
                request.setPhone(verifiedPhone);
            } catch (Exception e) {
                System.err.println("Firebase Token Error: " + e.getMessage());
                throw new RuntimeException("Xác thực số điện thoại thất bại! Vui lòng thử lại.");
            }
        } else if (request.getOtp() != null) {
            String verifyKey = (request.getEmail() != null && !request.getEmail().isEmpty()) ? request.getEmail() : request.getPhone();
            if (!otpService.verifyOtp(verifyKey, request.getOtp())) {
                throw new RuntimeException("Mã OTP không chính xác hoặc đã hết hạn!");
            }
        }

        var user = User.builder()
                .fullName(request.getName())
                .username(request.getEmail())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .provider(AuthProvider.LOCAL)
                .build();
        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .user(user)
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .user(user)
                .build();
    }

    public boolean verifyForgotOtp(String email, String otp) {
        return otpService.verifyOtpForReset(email, otp);
    }

    public void resetPassword(com.bookstore.dto.ResetPasswordRequest request) {
        if (!otpService.hasResetSession(request.getEmail())) {
            throw new RuntimeException("Bạn chưa xác thực mã OTP hoặc phiên làm việc đã hết hạn!");
        }
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với Email này!"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpService.clearResetSession(request.getEmail());
    }

    public AuthResponse socialLogin(SocialLoginRequest request) {
        AuthProvider provider;
        try {
            provider = AuthProvider.valueOf(request.getProvider().toUpperCase());
        } catch (Exception e) {
            provider = AuthProvider.LOCAL;
        }

        if (request.getToken() != null && !request.getToken().isEmpty()) {
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getToken());
                request.setEmail(decodedToken.getEmail());
                if (decodedToken.getName() != null) request.setName(decodedToken.getName());
                request.setProviderId(decodedToken.getUid());
            } catch (Exception e) {
                System.err.println("Lỗi xác thực Social Login Firebase: " + e.getMessage());
                throw new RuntimeException("Xác thực đăng nhập thất bại!");
            }
        }

        var userOpt = userRepository.findByEmail(request.getEmail());
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            // Nếu email đã tồn tại nhưng provider khác, có thể update provider hoặc cảnh báo.
            // Tạm thời cứ đăng nhập bình thường.
        } else {
            user = User.builder()
                    .fullName(request.getName())
                    .username(request.getEmail())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password cho OAuth
                    .role(Role.USER)
                    .provider(provider)
                    .providerId(request.getProviderId())
                    .build();
            user = userRepository.save(user);
        }

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .user(user)
                .build();
    }
}
