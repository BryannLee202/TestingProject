package com.bookstore.service;

import com.bookstore.entity.Notification;
import com.bookstore.entity.User;
import com.bookstore.repository.NotificationRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<Notification> getNotificationsByUser(String username) {
        if (username == null || username.equals("anonymousUser") || username.isEmpty()) {
            return notificationRepository.findByUserIdIsNullOrderByCreatedAtDesc();
        }
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return notificationRepository.findByUserIdIsNullOrderByCreatedAtDesc();
        }
        return notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(user.getId());
    }

    public long getUnreadCount(String username) {
        if (username == null || username.equals("anonymousUser") || username.isEmpty()) {
            return 0;
        }
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return 0;
        }
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    public Notification createNotification(Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo!"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            List<Notification> notifications = notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(user.getId());
            for (Notification notification : notifications) {
                if (notification.getUserId() != null && notification.getUserId().equals(user.getId())) {
                    notification.setIsRead(true);
                }
            }
            notificationRepository.saveAll(notifications);
        }
    }
}
