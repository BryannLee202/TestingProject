package com.bookstore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class EmailService {

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@yiyibook.vn}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        // Ưu tiên Brevo API (hoạt động trên mọi cloud, không bị chặn SMTP)
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendViaBrevo(toEmail, otp);
        } else if (mailSender != null) {
            sendViaSMTP(toEmail, otp);
        } else {
            System.err.println("Không có cấu hình gửi email! OTP dự phòng: " + otp);
            throw new RuntimeException("Chưa cấu hình dịch vụ gửi email trên Server!");
        }
    }

    private void sendViaBrevo(String toEmail, String otp) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            String htmlBody = "<div style='font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px'>"
                    + "<div style='text-align:center;margin-bottom:24px'>"
                    + "<h2 style='color:#C92127;margin:0'>YiYi Book</h2>"
                    + "</div>"
                    + "<p style='color:#374151;font-size:15px'>Xin chào,</p>"
                    + "<p style='color:#374151;font-size:15px'>Mã xác nhận OTP của bạn là:</p>"
                    + "<div style='text-align:center;margin:24px 0'>"
                    + "<span style='font-size:36px;font-weight:bold;letter-spacing:8px;color:#C92127;background:#fff5f5;padding:16px 32px;border-radius:8px;display:inline-block'>" + otp + "</span>"
                    + "</div>"
                    + "<p style='color:#6b7280;font-size:13px'>Mã có hiệu lực trong <b>5 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>"
                    + "<hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'>"
                    + "<p style='color:#9ca3af;font-size:12px;text-align:center'>© 2026 YiYi Book - Cảm ơn bạn đã sử dụng dịch vụ!</p>"
                    + "</div>";

            Map<String, Object> payload = Map.of(
                "sender", Map.of("name", "YiYi Book", "email", fromEmail),
                "to", new Object[]{ Map.of("email", toEmail) },
                "subject", "Mã xác nhận OTP - YiYi Book",
                "htmlContent", htmlBody
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.brevo.com/v3/smtp/email", request, String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Brevo: Đã gửi OTP tới " + toEmail);
            } else {
                System.err.println("Brevo: Lỗi gửi email - " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("Brevo exception: " + e.getMessage());
            // Thử fallback SMTP nếu có
            if (mailSender != null) {
                System.out.println("Fallback sang SMTP...");
                sendViaSMTP(toEmail, otp);
            } else {
                throw new RuntimeException("Gửi Email thất bại. Hệ thống bị lỗi cấu hình Email API.");
            }
        }
    }

    private void sendViaSMTP(String toEmail, String otp) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã xác nhận OTP - YiYi Book");
            message.setText("Xin chào,\n\nMã xác nhận OTP của bạn là: " + otp
                    + "\n\nMã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nĐội ngũ YiYi Book");
            mailSender.send(message);
            System.out.println("SMTP: Đã gửi OTP tới " + toEmail);
        } catch (Exception e) {
            System.err.println("SMTP lỗi: " + e.getMessage());
            throw new RuntimeException("Gửi Email thất bại. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau.");
        }
    }
}
