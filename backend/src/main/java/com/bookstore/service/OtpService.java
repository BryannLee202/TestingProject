package com.bookstore.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // K/V = phone/otp
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    @Autowired
    private EmailService emailService;

    public String generateAndSendOtp(String phone, String email) {
        // Generate 6 digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        System.out.println("========== MÃ OTP DỰ PHÒNG ==========");
        System.out.println("Sử dụng Firebase Phone Auth, SMS OTP sẽ được gửi trực tiếp bởi Firebase.");
        System.out.println("Tuy nhiên, đây là mã dự phòng để test qua Email/Console: " + otp);
        System.out.println("======================================");
        
        // Gửi OTP qua Email
        if (email != null && !email.isEmpty()) {
            try {
                emailService.sendOtpEmail(email, otp);
            } catch (Exception ex) {
                System.err.println("Không thể gửi email dự phòng: " + ex.getMessage());
            }
        }
        
        otpStorage.put(phone, otp);
        return otp;
    }

    public boolean verifyOtp(String phone, String otp) {
        String storedOtp = otpStorage.get(phone);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(phone); // OTP used
            return true;
        }
        // Cho phép 123456 làm bypass test
        if ("123456".equals(otp)) {
            return true;
        }
        return false;
    }
}
