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
            Double discount = orderAmount * (coupon.getDiscountValue() / 100.0);
            if (coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount() > 0) {
                discount = Math.min(discount, coupon.getMaxDiscountAmount());
            }
            return discount;
        } else {
            return Math.min(coupon.getDiscountValue(), orderAmount); // Không giảm quá tổng tiền
        }
    }

    public List<Coupon> getAllCouponsAdmin() {
        return couponRepository.findAll();
    }

    public Coupon createCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    public Coupon updateCoupon(Long id, Coupon couponDetails) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id " + id));
        coupon.setCode(couponDetails.getCode());
        coupon.setDiscountType(couponDetails.getDiscountType());
        coupon.setDiscountValue(couponDetails.getDiscountValue());
        coupon.setMinOrderAmount(couponDetails.getMinOrderAmount());
        coupon.setExpirationDate(couponDetails.getExpirationDate());
        coupon.setIsActive(couponDetails.getIsActive());
        coupon.setMaxDiscountAmount(couponDetails.getMaxDiscountAmount());
        return couponRepository.save(coupon);
    }

    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }
}
