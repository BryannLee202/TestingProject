package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    @Column(name = "min_order_amount")
    private Double minOrderAmount = 0.0;

    @Column(name = "expiration_date")
    private LocalDateTime expirationDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "max_discount_amount")
    private Double maxDiscountAmount;

    @Column(name = "user_id")
    private Long userId;

    private String category; // DISCOUNT or SHIPPING

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "is_partner")
    private Boolean isPartner = false;
}
