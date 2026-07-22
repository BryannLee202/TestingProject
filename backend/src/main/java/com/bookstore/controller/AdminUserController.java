package com.bookstore.controller;

import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.*;
import com.bookstore.entity.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired private UserRepository userRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        User user = userOpt.get();
        try {
            Role newRole = Role.valueOf(request.get("role").toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role"));
        }
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        try {
            // Dùng SQL trực tiếp để tránh vấn đề transaction rollback-only
            jdbcTemplate.update("DELETE FROM otp_store WHERE otp_key = (SELECT email FROM users WHERE id = ?)", id);
            jdbcTemplate.update("DELETE FROM notifications WHERE user_id = ?", id);
            jdbcTemplate.update("DELETE FROM wishlists WHERE user_id = ?", id);
            jdbcTemplate.update("DELETE FROM point_transactions WHERE user_id = ?", id);
            jdbcTemplate.update("DELETE FROM review_comments WHERE review_id IN (SELECT id FROM reviews WHERE user_id = ?)", id);
            jdbcTemplate.update("DELETE FROM review_likes WHERE review_id IN (SELECT id FROM reviews WHERE user_id = ?)", id);
            jdbcTemplate.update("DELETE FROM review_likes WHERE user_id = ?", id);
            jdbcTemplate.update("DELETE FROM reviews WHERE user_id = ?", id);
            // Xóa order items trước, rồi xóa orders
            jdbcTemplate.update("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)", id);
            jdbcTemplate.update("DELETE FROM orders WHERE user_id = ?", id);
            jdbcTemplate.update("DELETE FROM addresses WHERE user_id = ?", id);
            jdbcTemplate.update("DELETE FROM vat_invoices WHERE user_id = ?", id);
            jdbcTemplate.update("DELETE FROM user_rewards WHERE user_id = ?", id);
            // Xóa cart items trước, rồi xóa cart
            jdbcTemplate.update("DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)", id);
            jdbcTemplate.update("DELETE FROM carts WHERE user_id = ?", id);
            // Xóa coupon của user này
            jdbcTemplate.update("DELETE FROM coupons WHERE user_id = ?", id);
            // Cuối cùng xóa user
            jdbcTemplate.update("DELETE FROM users WHERE id = ?", id);

            return ResponseEntity.ok(Map.of("message", "Đã xóa người dùng thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi xóa: " + e.getMessage()));
        }
    }
}
