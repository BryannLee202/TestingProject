package com.bookstore.controller;

import com.bookstore.entity.Notification;
import com.bookstore.entity.User;
import com.bookstore.repository.NotificationRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.NotificationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(notificationService.getNotificationsByUser(username));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(notificationService.getUnreadCount(username));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        if (authentication != null) {
            notificationService.markAllAsRead(authentication.getName());
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.createNotification(notification));
    }

    // ---- ADMIN ENDPOINTS ----

    /** Get all notifications in the system (for admin dashboard) */
    @GetMapping("/admin/all")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> all = notificationRepository.findAll(
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        );
        return ResponseEntity.ok(all);
    }

    /** Admin: send notification to a specific user or broadcast (userId=null) */
    @PostMapping("/admin/send")
    public ResponseEntity<Notification> adminSendNotification(@RequestBody AdminNotificationRequest request) {
        Notification notification = Notification.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "SYSTEM")
                .userId(request.getUserId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(notificationService.createNotification(notification));
    }

    /** Delete a notification */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class AdminNotificationRequest {
        private String title;
        private String content;
        private String type;
        private Long userId; // null = broadcast to all
    }
}
