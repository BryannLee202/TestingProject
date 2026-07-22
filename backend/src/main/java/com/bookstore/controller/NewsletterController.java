package com.bookstore.controller;

import com.bookstore.service.NewsletterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    @Autowired
    private NewsletterService newsletterService;

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            newsletterService.subscribe(email);
            return ResponseEntity.ok().body(Map.of("message", "Đăng ký nhận bản tin thành công!"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Đã xảy ra lỗi hệ thống."));
        }
    }

    @PostMapping("/send-bulk")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendBulkNewsletter(@RequestBody Map<String, String> payload) {
        try {
            String subject = payload.get("subject");
            String body = payload.get("body");
            if (subject == null || body == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tiêu đề và nội dung không được để trống."));
            }
            newsletterService.sendBulkNewsletter(subject, body);
            return ResponseEntity.ok().body(Map.of("message", "Đã gửi yêu cầu gửi email hàng loạt thành công."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi khi gửi bản tin."));
        }
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllSubscribers() {
        try {
            return ResponseEntity.ok(newsletterService.getAllSubscribers());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi lấy danh sách đăng ký."));
        }
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubscriber(@PathVariable Long id) {
        try {
            newsletterService.deleteSubscriber(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa email đăng ký thành công."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi xóa email đăng ký."));
        }
    }
}
