package com.bookstore.service;

import com.bookstore.entity.Coupon;
import com.bookstore.entity.DiscountType;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public List<Coupon> getAllActiveCoupons() {
        return couponRepository.findByIsActiveTrue();
    }

    public List<Coupon> getAvailableCouponsForUser(String username) {
        List<Coupon> activeCoupons = couponRepository.findByIsActiveTrue();
        if (username == null) {
            return activeCoupons.stream().filter(c -> c.getUserId() == null).toList();
        }
        
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return activeCoupons.stream().filter(c -> c.getUserId() == null).toList();
        }

        return activeCoupons.stream()
                .filter(c -> {
                    if (c.getUserId() != null && !c.getUserId().equals(user.getId())) return false;
                    long usage = orderRepository.countUsageByUser(user, c.getCode());
                    return usage == 0;
                })
                .toList();
    }

    public List<java.util.Map<String, Object>> getCouponUsageHistory(String username) {
        if (username == null) throw new RuntimeException("Chưa đăng nhập");
        User user = userRepository.findByUsername(username).orElseThrow();
        
        List<com.bookstore.entity.Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        List<java.util.Map<String, Object>> history = new java.util.ArrayList<>();
        
        for (com.bookstore.entity.Order o : orders) {
            if ("CANCELLED".equals(o.getStatus())) continue;
            
            if (o.getDiscountCouponCode() != null && !o.getDiscountCouponCode().isEmpty()) {
                history.add(java.util.Map.of(
                        "orderId", o.getId(),
                        "createdAt", o.getCreatedAt(),
                        "couponCode", o.getDiscountCouponCode(),
                        "type", "Giảm giá sản phẩm",
                        "status", o.getStatus()
                ));
            }
            if (o.getShippingCouponCode() != null && !o.getShippingCouponCode().isEmpty()) {
                history.add(java.util.Map.of(
                        "orderId", o.getId(),
                        "createdAt", o.getCreatedAt(),
                        "couponCode", o.getShippingCouponCode(),
                        "type", "Miễn phí vận chuyển",
                        "status", o.getStatus()
                ));
            }
        }
        return history;
    }

    public Coupon validateCoupon(String code, Double orderAmount, String username) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại hoặc đã hết hạn!"));

        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn sử dụng!");
        }

        if (orderAmount < coupon.getMinOrderAmount()) {
            throw new RuntimeException("Đơn hàng tối thiểu để sử dụng mã này là " 
                    + String.format("%,.0f", coupon.getMinOrderAmount()) + " đ");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() <= 0) {
            throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng!");
        }

        if (coupon.getUserId() != null) {
            if (username == null) {
                throw new RuntimeException("Mã giảm giá này thuộc về người dùng khác. Vui lòng đăng nhập!");
            }
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            if (!coupon.getUserId().equals(user.getId())) {
                throw new RuntimeException("Mã giảm giá này thuộc về người dùng khác!");
            }
        }

        if (username != null) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            long usage = orderRepository.countUsageByUser(user, coupon.getCode());
            if (usage > 0) {
                throw new RuntimeException("Bạn đã sử dụng mã giảm giá này rồi. Mỗi tài khoản chỉ được dùng 1 lần!");
            }
        }

        return coupon;
    }

    public void useCoupon(Coupon coupon) {
        if (coupon != null && coupon.getUsageLimit() != null) {
            int remaining = coupon.getUsageLimit() - 1;
            coupon.setUsageLimit(remaining);
            if (remaining <= 0) {
                coupon.setIsActive(false);
            }
            couponRepository.save(coupon);
        }
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
        coupon.setUserId(couponDetails.getUserId());
        coupon.setCategory(couponDetails.getCategory());
        coupon.setUsageLimit(couponDetails.getUsageLimit());
        return couponRepository.save(coupon);
    }

    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }
}
