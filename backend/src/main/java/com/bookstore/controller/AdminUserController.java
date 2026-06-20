package com.bookstore.controller;

import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.CartRepository;
import com.bookstore.entity.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    // Lấy danh sách tất cả user
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // Cập nhật quyền (role)
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

    // Xóa người dùng
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        
        try {
            // Xóa giỏ hàng trước (vì giỏ hàng tự động tạo khi đăng ký)
            Optional<Cart> cartOpt = cartRepository.findByUserId(id);
            cartOpt.ifPresent(cart -> cartRepository.delete(cart));

            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            // Lỗi do Data Integrity (đã có đơn hàng hoặc đánh giá)
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Không thể xóa người dùng này vì họ đã có dữ liệu giao dịch (Đơn hàng/Đánh giá)."));
        }
    }
}
