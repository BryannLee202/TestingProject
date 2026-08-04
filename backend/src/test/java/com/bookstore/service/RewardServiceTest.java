package com.bookstore.service;

import com.bookstore.entity.*;
import com.bookstore.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RewardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private PointTransactionRepository pointTransactionRepository;

    @Mock
    private RewardVoucherRepository rewardVoucherRepository;

    @Mock
    private UserRewardRepository userRewardRepository;

    @InjectMocks
    private RewardService rewardService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .yPoints(30000)
                .freeShipCoupons(0)
                .build();
    }

    @Test
    void exchangePoints_Success_Freeship() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        rewardService.exchangePoints("testuser", 20000, "FREESHIP");

        assertEquals(10000, testUser.getYPoints());
        assertEquals(2, testUser.getFreeShipCoupons());

        verify(userRepository, times(1)).save(testUser);
        verify(pointTransactionRepository, times(1)).save(any(PointTransaction.class));
        verify(couponRepository, never()).save(any(Coupon.class));
    }

    @Test
    void exchangePoints_Failure_NotEnoughPoints() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            rewardService.exchangePoints("testuser", 40000, "FREESHIP");
        });

        assertEquals("Không đủ Y-Points để đổi!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
        verify(pointTransactionRepository, never()).save(any(PointTransaction.class));
    }

    @Test
    void exchangePoints_Failure_InvalidDiscount20kPoints() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            rewardService.exchangePoints("testuser", 10000, "DISCOUNT_20K");
        });

        assertEquals("Cần đúng 20,000 điểm để đổi mã giảm 20K.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
        verify(pointTransactionRepository, never()).save(any(PointTransaction.class));
    }

    @Test
    void exchangePoints_Success_Discount20k() {
        testUser.setYPoints(25000);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        rewardService.exchangePoints("testuser", 20000, "DISCOUNT_20K");

        assertEquals(5000, testUser.getYPoints());

        ArgumentCaptor<Coupon> couponCaptor = ArgumentCaptor.forClass(Coupon.class);
        verify(couponRepository, times(1)).save(couponCaptor.capture());

        Coupon savedCoupon = couponCaptor.getValue();
        assertNotNull(savedCoupon);
        assertTrue(savedCoupon.getCode().startsWith("VIP20K-"));
        assertEquals(20000.0, savedCoupon.getDiscountValue());
        assertEquals(1L, savedCoupon.getUserId());

        verify(userRepository, times(1)).save(testUser);
        verify(pointTransactionRepository, times(1)).save(any(PointTransaction.class));
    }

    @Test
    void redeemVoucher_Success_Points() {
        RewardVoucher voucher = RewardVoucher.builder()
                .id(10L)
                .code("WELCOME100")
                .isActive(true)
                .rewardType("POINTS")
                .rewardValue(100)
                .expirationDate(LocalDateTime.now().plusDays(10))
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(rewardVoucherRepository.findByCode("WELCOME100")).thenReturn(Optional.of(voucher));
        when(userRewardRepository.existsByUserIdAndVoucherId(1L, 10L)).thenReturn(false);

        rewardService.redeemVoucher("testuser", "WELCOME100");

        assertEquals(30100, testUser.getYPoints());
        verify(userRepository).save(testUser);
        verify(userRewardRepository).save(any(UserReward.class));
        verify(pointTransactionRepository).save(any(PointTransaction.class));
    }

    @Test
    void redeemVoucher_Failure_InactiveVoucher() {
        RewardVoucher voucher = RewardVoucher.builder()
                .id(10L)
                .code("INACTIVE")
                .isActive(false)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(rewardVoucherRepository.findByCode("INACTIVE")).thenReturn(Optional.of(voucher));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            rewardService.redeemVoucher("testuser", "INACTIVE");
        });

        assertEquals("Lỗi: mã không còn hoạt động.", exception.getMessage());
    }

    @Test
    void redeemVoucher_Failure_ExpiredVoucher() {
        RewardVoucher voucher = RewardVoucher.builder()
                .id(10L)
                .code("EXPIRED")
                .isActive(true)
                .expirationDate(LocalDateTime.now().minusDays(1))
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(rewardVoucherRepository.findByCode("EXPIRED")).thenReturn(Optional.of(voucher));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            rewardService.redeemVoucher("testuser", "EXPIRED");
        });

        assertEquals("Lỗi: mã đã hết hạn.", exception.getMessage());
    }
}
