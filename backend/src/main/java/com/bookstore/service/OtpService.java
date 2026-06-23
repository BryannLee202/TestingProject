package com.bookstore.service;

import com.bookstore.entity.OtpStore;
import com.bookstore.repository.OtpStoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpStoreRepository otpStoreRepository;

    // Session riêng cho quên mật khẩu (ngắn hạn, chỉ cần trong RAM)
    private final Map<String, Boolean> resetPasswordSessions = new ConcurrentHashMap<>();

    public String generateAndSendOtp(String phone, String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));

        System.out.println("OTP được tạo cho " + email + " (lưu vào DB, hạn 5 phút)");

        // Lưu OTP vào database với thời hạn 5 phút
        OtpStore store = OtpStore.builder()
                .email(email != null && !email.isEmpty() ? email : phone)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();
        otpStoreRepository.save(store);

        // Gửi OTP qua Email
        if (email != null && !email.isEmpty()) {
            try {
                emailService.sendOtpEmail(email, otp);
            } catch (Exception ex) {
                System.err.println("Không thể gửi email OTP: " + ex.getMessage());
            }
        }

        return otp;
    }

    public boolean verifyOtp(String key, String otp) {
        // Bypass test (có thể xóa sau khi production ổn định)
        if ("123456".equals(otp)) {
            return true;
        }

        Optional<OtpStore> stored = otpStoreRepository
                .findTopByEmailAndUsedFalseOrderByExpiresAtDesc(key);

        if (stored.isEmpty()) {
            System.err.println("Không tìm thấy OTP cho key: " + key);
            return false;
        }

        OtpStore otpStore = stored.get();

        if (LocalDateTime.now().isAfter(otpStore.getExpiresAt())) {
            System.err.println("OTP đã hết hạn cho key: " + key);
            return false;
        }

        if (!otpStore.getOtp().equals(otp)) {
            System.err.println("OTP không khớp cho key: " + key);
            return false;
        }

        // Đánh dấu đã dùng
        otpStore.setUsed(true);
        otpStoreRepository.save(otpStore);
        return true;
    }

    // Dành riêng cho Quên mật khẩu
    public boolean verifyOtpForReset(String email, String otp) {
        boolean isValid = verifyOtp(email, otp);
        if (isValid) {
            resetPasswordSessions.put(email, true);
        }
        return isValid;
    }

    public boolean hasResetSession(String email) {
        return resetPasswordSessions.getOrDefault(email, false);
    }

    public void clearResetSession(String email) {
        resetPasswordSessions.remove(email);
    }
}
