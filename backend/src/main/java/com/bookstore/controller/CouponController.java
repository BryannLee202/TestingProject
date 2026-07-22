package com.bookstore.controller;

import com.bookstore.entity.Coupon;
import com.bookstore.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons(Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(couponService.getAvailableCouponsForUser(username));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getCouponHistory(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(couponService.getCouponUsageHistory(principal.getName()));
    }

    @GetMapping("/validate")
    public ResponseEntity<CouponResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam Double amount,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : null;
            Coupon coupon = couponService.validateCoupon(code, amount, username);
            Double discount = couponService.calculateDiscount(coupon, amount);
            return ResponseEntity.ok(new CouponResponse(true, coupon, discount, null));
        } catch (Exception e) {
            return ResponseEntity.ok(new CouponResponse(false, null, 0.0, e.getMessage()));
        }
    }

    public record CouponResponse(boolean valid, Coupon coupon, Double discountAmount, String message) {}

    // Admin endpoints
    @GetMapping("/all")
    public ResponseEntity<List<Coupon>> getAllCouponsAdmin() {
        return ResponseEntity.ok(couponService.getAllCouponsAdmin());
    }

    @PostMapping
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.createCoupon(coupon));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable Long id, @RequestBody Coupon couponDetails) {
        return ResponseEntity.ok(couponService.updateCoupon(id, couponDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok().build();
    }
}
