package com.bookstore.controller;

import com.bookstore.entity.Coupon;
import com.bookstore.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllActiveCoupons());
    }

    @GetMapping("/validate")
    public ResponseEntity<CouponResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam Double amount) {
        try {
            Coupon coupon = couponService.validateCoupon(code, amount);
            Double discount = couponService.calculateDiscount(coupon, amount);
            return ResponseEntity.ok(new CouponResponse(true, coupon, discount, null));
        } catch (Exception e) {
            return ResponseEntity.ok(new CouponResponse(false, null, 0.0, e.getMessage()));
        }
    }

    public record CouponResponse(boolean valid, Coupon coupon, Double discountAmount, String message) {}
}
