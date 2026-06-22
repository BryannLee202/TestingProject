package com.bookstore.service;

import com.bookstore.entity.NewsletterSubscriber;
import com.bookstore.repository.NewsletterSubscriberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class NewsletterService {

    @Autowired
    private NewsletterSubscriberRepository repository;

    @Autowired
    private JavaMailSender mailSender;

    public void subscribe(String email) {
        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            throw new IllegalArgumentException("Email không hợp lệ.");
        }
        email = email.trim().toLowerCase();

        Optional<NewsletterSubscriber> existing = repository.findByEmail(email);
        if (existing.isPresent()) {
            NewsletterSubscriber sub = existing.get();
            if (!sub.isActive()) {
                sub.setActive(true);
                repository.save(sub);
            } else {
                throw new IllegalStateException("Email này đã được đăng ký từ trước.");
            }
        } else {
            NewsletterSubscriber subscriber = new NewsletterSubscriber();
            subscriber.setEmail(email);
            repository.save(subscriber);
            
            // Send welcome email
            sendWelcomeEmail(email);
        }
    }

    private void sendWelcomeEmail(String toEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("dinhphan0511@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Cảm ơn bạn đã đăng ký nhận bản tin YiYi Book!");
            message.setText("Chào bạn,\n\n" +
                    "Cảm ơn bạn đã quan tâm và đăng ký nhận thông tin từ YiYi Book.\n" +
                    "Chúng tôi sẽ gửi đến bạn những ưu đãi và sách mới nhất sớm nhất có thể!\n\n" +
                    "Trân trọng,\nĐội ngũ YiYi Book");
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Không thể gửi email đến " + toEmail + ": " + e.getMessage());
            // Lỗi gửi mail không nên rollback transaction lưu DB
        }
    }

    public void sendBulkNewsletter(String subject, String body) {
        List<NewsletterSubscriber> subscribers = repository.findAll();
        
        CompletableFuture.runAsync(() -> {
            for (NewsletterSubscriber sub : subscribers) {
                if (sub.isActive()) {
                    try {
                        SimpleMailMessage message = new SimpleMailMessage();
                        message.setFrom("dinhphan0511@gmail.com");
                        message.setTo(sub.getEmail());
                        message.setSubject(subject);
                        message.setText(body);
                        
                        mailSender.send(message);
                    } catch (Exception e) {
                        System.err.println("Lỗi gửi bulk email tới " + sub.getEmail() + ": " + e.getMessage());
                    }
                }
            }
        });
    }
}
