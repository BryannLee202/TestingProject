package com.bookstore.service;

import com.bookstore.entity.Coupon;
import com.bookstore.entity.DiscountType;
import com.bookstore.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public List<Coupon> getAllActiveCoupons() {
        return couponRepository.findByIsActiveTrue();
    }

    public Coupon validateCoupon(String code, Double orderAmount) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại hoặc đã hết hạn!"));

        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn sử dụng!");
        }

        if (orderAmount < coupon.getMinOrderAmount()) {
            throw new RuntimeException("Đơn hàng tối thiểu để sử dụng mã này là " 
                    + String.format("%,.0f", coupon.getMinOrderAmount()) + " đ");
        }

        return coupon;
    }

    public Double calculateDiscount(Coupon coupon, Double orderAmount) {
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            return orderAmount * (coupon.getDiscountValue() / 100.0);
        } else {
            return Math.min(coupon.getDiscountValue(), orderAmount); // Không giảm quá tổng tiền
        }
    }
}
