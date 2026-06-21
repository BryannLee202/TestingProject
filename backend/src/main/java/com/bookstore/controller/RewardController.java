package com.bookstore.controller;

import com.bookstore.entity.PointTransaction;
import com.bookstore.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RewardController {

    private final RewardService rewardService;

    @PostMapping("/redeem")
    public ResponseEntity<?> redeemVoucher(Authentication authentication, @RequestBody Map<String, String> request) {
        String code = request.get("code");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập mã."));
        }
        try {
            rewardService.redeemVoucher(authentication.getName(), code);
            return ResponseEntity.ok(Map.of("message", "Nạp thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<PointTransaction>> getHistory(Authentication authentication) {
        return ResponseEntity.ok(rewardService.getHistory(authentication.getName()));
    }

    @PostMapping("/exchange")
    public ResponseEntity<?> exchangePoints(Authentication authentication, @RequestBody Map<String, Object> request) {
        try {
            int points = Integer.parseInt(request.get("points").toString());
            String type = request.get("type").toString();
            rewardService.exchangePoints(authentication.getName(), points, type);
            return ResponseEntity.ok(Map.of("message", "Đổi quà thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
