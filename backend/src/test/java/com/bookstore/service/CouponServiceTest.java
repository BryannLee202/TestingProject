package com.bookstore.service;

import com.bookstore.entity.Coupon;
import com.bookstore.entity.DiscountType;
import com.bookstore.entity.User;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private CouponService couponService;

    private Coupon testCoupon;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("couponuser")
                .build();

        testCoupon = Coupon.builder()
                .id(10L)
                .code("DISCOUNT20")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(20.0)
                .minOrderAmount(100000.0)
                .maxDiscountAmount(50000.0)
                .expirationDate(LocalDateTime.now().plusDays(5))
                .isActive(true)
                .usageLimit(10)
                .build();
    }

    @Test
    void validateCoupon_Success() {
        when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue("DISCOUNT20")).thenReturn(Optional.of(testCoupon));
        when(userRepository.findByUsername("couponuser")).thenReturn(Optional.of(testUser));
        when(orderRepository.countUsageByUser(testUser, "DISCOUNT20")).thenReturn(0L);

        Coupon validated = couponService.validateCoupon("DISCOUNT20", 200000.0, "couponuser");

        assertNotNull(validated);
        assertEquals("DISCOUNT20", validated.getCode());
    }

    @Test
    void validateCoupon_Expired_ThrowsException() {
        testCoupon.setExpirationDate(LocalDateTime.now().minusDays(1));
        when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue("DISCOUNT20")).thenReturn(Optional.of(testCoupon));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            couponService.validateCoupon("DISCOUNT20", 200000.0, "couponuser");
        });

        assertEquals("Mã giảm giá đã hết hạn sử dụng!", exception.getMessage());
    }

    @Test
    void validateCoupon_MinOrderAmountNotMet_ThrowsException() {
        when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue("DISCOUNT20")).thenReturn(Optional.of(testCoupon));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            couponService.validateCoupon("DISCOUNT20", 50000.0, "couponuser");
        });

        assertTrue(exception.getMessage().contains("Đơn hàng tối thiểu để sử dụng mã này là"));
    }

    @Test
    void validateCoupon_AlreadyUsedByUser_ThrowsException() {
        when(couponRepository.findByCodeIgnoreCaseAndIsActiveTrue("DISCOUNT20")).thenReturn(Optional.of(testCoupon));
        when(userRepository.findByUsername("couponuser")).thenReturn(Optional.of(testUser));
        when(orderRepository.countUsageByUser(testUser, "DISCOUNT20")).thenReturn(1L);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            couponService.validateCoupon("DISCOUNT20", 200000.0, "couponuser");
        });

        assertTrue(exception.getMessage().contains("Bạn đã sử dụng mã giảm giá này rồi"));
    }

    @Test
    void calculateDiscount_PercentageWithMaxLimit() {
        // 20% of 400,000 is 80,000, but max discount is 50,000
        Double discount = couponService.calculateDiscount(testCoupon, 400000.0);

        assertEquals(50000.0, discount);
    }

    @Test
    void calculateDiscount_FixedAmount() {
        Coupon fixedCoupon = Coupon.builder()
                .discountType(DiscountType.FIXED)
                .discountValue(30000.0)
                .build();

        Double discount = couponService.calculateDiscount(fixedCoupon, 100000.0);

        assertEquals(30000.0, discount);
    }

    @Test
    void useCoupon_DecrementsUsageLimit() {
        couponService.useCoupon(testCoupon);

        assertEquals(9, testCoupon.getUsageLimit());
        assertTrue(testCoupon.getIsActive());
        verify(couponRepository).save(testCoupon);
    }

    @Test
    void useCoupon_DeactivatesWhenLimitReachesZero() {
        testCoupon.setUsageLimit(1);

        couponService.useCoupon(testCoupon);

        assertEquals(0, testCoupon.getUsageLimit());
        assertFalse(testCoupon.getIsActive());
        verify(couponRepository).save(testCoupon);
    }
}
