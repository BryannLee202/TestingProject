package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.entity.AuthProvider;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.entity.Coupon;
import com.bookstore.entity.DiscountType;
import com.bookstore.entity.PointTransaction;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.PointTransactionRepository;
import com.bookstore.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final CouponRepository couponRepository;
    private final PointTransactionRepository pointTransactionRepository;

    private void applyRegistrationGift(User user) {
        user.setYPoints(20000);
        user.setAccumulatedPoints(20000);
        userRepository.save(user);

        pointTransactionRepository.save(PointTransaction.builder()
                .user(user)
                .action("REGISTER_GIFT")
                .description("Tặng điểm chào mừng thành viên mới")
                .previousBalance(0)
                .transactionValue(20000)
                .newBalance(20000)
                .createdAt(java.time.LocalDateTime.now())
                .build());

        couponRepository.save(Coupon.builder()
                .code("FREESHIP_" + user.getId() + "_" + (System.currentTimeMillis() % 10000))
                .discountType(DiscountType.FIXED)
                .discountValue(30000.0)
                .category("SHIPPING")
                .userId(user.getId())
                .usageLimit(1)
                .isActive(true)
                .isPartner(false)
                .expirationDate(java.time.LocalDateTime.now().plusDays(30))
                .build());
    }

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
        
        if (request.getOtp() != null) {
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

        applyRegistrationGift(user);

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
}
