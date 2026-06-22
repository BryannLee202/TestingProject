package com.bookstore.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã xác nhận OTP - Grape Book");
            message.setText("Xin chào,\n\nMã xác nhận OTP (Một lần) của bạn để đăng ký tài khoản tại Grape Book là: " + otp + "\n\nVui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nĐội ngũ Grape Book");
            
            mailSender.send(message);
            System.out.println("Đã gửi OTP qua Email tới: " + toEmail);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email: " + e.getMessage());
            throw new RuntimeException("Không thể gửi email OTP: " + e.getMessage());
        }
    }
}
