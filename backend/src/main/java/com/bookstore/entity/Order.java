package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String status; // PENDING, PROCESSING, COMPLETED, CANCELLED

    @Column(name = "shipping_address", length = 500)
    private String shippingAddress;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "shipping_fee")
    private Double shippingFee = 0.0;

    @Column(name = "customer_note", length = 1000)
    private String customerNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_status")
    @Builder.Default
    private ShippingStatus shippingStatus = ShippingStatus.PENDING;

    @Column(name = "shipping_partner", length = 100)
    private String shippingPartner;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
