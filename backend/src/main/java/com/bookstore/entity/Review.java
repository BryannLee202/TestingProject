package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Book book;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String comment;

    @Column(name = "likes_count", nullable = false)
    @Builder.Default
    private Integer likesCount = 0;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "review", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JsonIgnoreProperties("review")
    private List<ReviewComment> comments;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "review_likes",
        joinColumns = @JoinColumn(name = "review_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.Set<User> likedByUsers = new java.util.HashSet<>();
}
