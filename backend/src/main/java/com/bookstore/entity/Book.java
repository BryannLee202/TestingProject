package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 255)
    private String author;

    @Column(length = 255)
    private String publisher;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "old_price", precision = 18, scale = 2)
    private BigDecimal oldPrice;

    @Column(name = "discount")
    private Integer discount = 0;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;
    
    @Column(name = "image_url", columnDefinition = "NVARCHAR(MAX)")
    private String imageUrl;

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "sales_count")
    private Integer salesCount = 0;

    @Column(name = "is_combo")
    private Boolean isCombo = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "book_additional_images", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "image_url", columnDefinition = "NVARCHAR(MAX)")
    private java.util.List<String> additionalImages = new java.util.ArrayList<>();
}
