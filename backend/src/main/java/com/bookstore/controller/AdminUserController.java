package com.bookstore.controller;

import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.*;
import com.bookstore.entity.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
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
    @Autowired private OrderRepository orderRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private PointTransactionRepository pointTransactionRepository;
    @Autowired private AddressRepository addressRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private WishlistRepository wishlistRepository;
    @Autowired private OtpStoreRepository otpStoreRepository;

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

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        try {
            // Xóa OTP entries
            try {
                var otps = otpStoreRepository.findAll().stream()
                        .filter(o -> o.getKey().equals(user.getEmail()) || o.getKey().equals(user.getUsername()))
                        .toList();
                otpStoreRepository.deleteAll(otps);
            } catch (Exception ignored) {}

            // Xóa thông báo
            try {
                notificationRepository.deleteAll(
                    notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(id)
                        .stream().filter(n -> id.equals(n.getUserId())).toList()
                );
            } catch (Exception ignored) {}

            // Xóa wishlist
            try { wishlistRepository.deleteAll(wishlistRepository.findByUserIdOrderByCreatedAtDesc(id)); } catch (Exception ignored) {}

            // Xóa lịch sử điểm
            try { pointTransactionRepository.deleteAll(pointTransactionRepository.findByUserIdOrderByCreatedAtDesc(id)); } catch (Exception ignored) {}

            // Xóa đánh giá
            try { reviewRepository.deleteAll(reviewRepository.findByUserIdOrderByCreatedAtDesc(id)); } catch (Exception ignored) {}

            // Xóa đơn hàng
            try { orderRepository.deleteAll(orderRepository.findByUserOrderByCreatedAtDesc(user)); } catch (Exception ignored) {}

            // Xóa địa chỉ
            try { addressRepository.deleteAll(addressRepository.findByUserId(id)); } catch (Exception ignored) {}

            // Xóa giỏ hàng
            try {
                Optional<Cart> cartOpt = cartRepository.findByUserId(id);
                cartOpt.ifPresent(cartRepository::delete);
            } catch (Exception ignored) {}

            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa người dùng thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi xóa: " + e.getMessage()));
        }
    }
}
