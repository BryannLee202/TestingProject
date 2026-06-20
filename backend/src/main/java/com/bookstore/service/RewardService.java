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
}
