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
@Table(name = "point_transactions")
public class PointTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String action; // "EARN_ORDER", "EARN_VOUCHER", "SPEND_ORDER"

    @Column(name = "previous_balance", nullable = false)
    private Integer previousBalance;

    @Column(name = "transaction_value", nullable = false)
    private Integer transactionValue; // Positive or negative

    @Column(name = "new_balance", nullable = false)
    private Integer newBalance;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "description")
    private String description;
}
