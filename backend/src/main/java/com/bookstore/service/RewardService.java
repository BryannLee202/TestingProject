package com.bookstore.service;

import com.bookstore.entity.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RewardService {
    private final RewardVoucherRepository rewardVoucherRepository;
    private final UserRewardRepository userRewardRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    @Transactional
    public void redeemVoucher(String username, String code) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));

        RewardVoucher voucher = rewardVoucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Lỗi: mã không tồn tại. Vui lòng sử dụng mã khác."));

        if (!voucher.getIsActive()) {
            throw new RuntimeException("Lỗi: mã không còn hoạt động.");
        }

        if (voucher.getExpirationDate() != null && voucher.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Lỗi: mã đã hết hạn.");
        }

        if (userRewardRepository.existsByUserIdAndVoucherId(user.getId(), voucher.getId())) {
            throw new RuntimeException("Lỗi: bạn đã sử dụng mã này rồi.");
        }

        // Add reward
        int oldBalance = user.getYPoints() == null ? 0 : user.getYPoints();
        int newBalance = oldBalance;
        
        if ("POINTS".equalsIgnoreCase(voucher.getRewardType())) {
            newBalance = oldBalance + voucher.getRewardValue();
            user.setYPoints(newBalance);
        } else if ("FREESHIP".equalsIgnoreCase(voucher.getRewardType())) {
            int oldFreeShip = user.getFreeShipCoupons() == null ? 0 : user.getFreeShipCoupons();
            user.setFreeShipCoupons(oldFreeShip + voucher.getRewardValue());
        }

        userRepository.save(user);

        // Record usage
        UserReward userReward = UserReward.builder()
                .user(user)
                .voucher(voucher)
                .redeemedAt(LocalDateTime.now())
                .build();
        userRewardRepository.save(userReward);

        // Record transaction
        PointTransaction transaction = PointTransaction.builder()
                .user(user)
                .action("EARN_VOUCHER")
                .description("Nhập mã: " + code)
                .previousBalance(oldBalance)
                .transactionValue(voucher.getRewardValue())
                .newBalance(newBalance)
                .createdAt(LocalDateTime.now())
                .build();
        pointTransactionRepository.save(transaction);
    }

    public List<PointTransaction> getHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));
        return pointTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public void exchangePoints(String username, int pointsToSpend, String rewardType) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));

        int currentPoints = user.getYPoints() == null ? 0 : user.getYPoints();
        if (currentPoints < pointsToSpend) {
            throw new RuntimeException("Không đủ Y-Points để đổi!");
        }

        if ("FREESHIP".equals(rewardType)) {
            if (pointsToSpend < 10000) throw new RuntimeException("Cần ít nhất 10,000 điểm để đổi mã Freeship.");
            int count = pointsToSpend / 10000;
            user.setFreeShipCoupons((user.getFreeShipCoupons() == null ? 0 : user.getFreeShipCoupons()) + count);
        } else if ("DISCOUNT_20K".equals(rewardType)) {
            if (pointsToSpend != 20000) throw new RuntimeException("Cần đúng 20,000 điểm để đổi mã giảm 20K.");
            Coupon coupon = Coupon.builder()
                    .code("VIP20K-" + System.currentTimeMillis())
                    .discountType(DiscountType.FIXED)
                    .discountValue(20000.0)
                    .minOrderAmount(0.0)
                    .expirationDate(LocalDateTime.now().plusDays(30))
                    .isActive(true)
                    .userId(user.getId())
                    .category("DISCOUNT")
                    .usageLimit(1)
                    .build();
            couponRepository.save(coupon);
        } else if ("DISCOUNT_50K".equals(rewardType)) {
            if (pointsToSpend != 50000) throw new RuntimeException("Cần đúng 50,000 điểm để đổi mã giảm 50K.");
            Coupon coupon = Coupon.builder()
                    .code("VIP50K-" + System.currentTimeMillis())
                    .discountType(DiscountType.FIXED)
                    .discountValue(50000.0)
                    .minOrderAmount(0.0)
                    .expirationDate(LocalDateTime.now().plusDays(30))
                    .isActive(true)
                    .userId(user.getId())
                    .category("DISCOUNT")
                    .usageLimit(1)
                    .build();
            couponRepository.save(coupon);
        } else {
            throw new RuntimeException("Loại quà không hợp lệ.");
        }

        user.setYPoints(currentPoints - pointsToSpend);
        userRepository.save(user);

        PointTransaction pt = PointTransaction.builder()
                .user(user)
                .action("SPEND_REWARD")
                .description("Đổi quà: " + rewardType)
                .previousBalance(currentPoints)
                .transactionValue(-pointsToSpend)
                .newBalance(currentPoints - pointsToSpend)
                .createdAt(LocalDateTime.now())
                .build();
        pointTransactionRepository.save(pt);
    }
}
