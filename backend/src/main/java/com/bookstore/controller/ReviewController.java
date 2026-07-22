package com.bookstore.controller;

import com.bookstore.entity.Review;
import com.bookstore.entity.ReviewComment;
import com.bookstore.service.ReviewService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<Review>> getReviewsByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(reviewService.getReviewsByBookId(bookId));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<Review>> getMyReviews(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(reviewService.getReviewsByUsername(authentication.getName()));
    }

    @PostMapping("/book/{bookId}")
    public ResponseEntity<Review> createReview(
            Authentication authentication,
            @PathVariable Long bookId,
            @RequestBody ReviewRequest request) {
        String username = authentication.getName();
        Review review = reviewService.createReview(username, bookId, request.getRating(), request.getComment(), request.getImageUrl());
        return ResponseEntity.ok(review);
    }

    // --- Like a review ---
    @PostMapping("/{reviewId}/like")
    public ResponseEntity<Review> likeReview(@PathVariable Long reviewId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(reviewService.likeReview(reviewId, authentication.getName()));
    }

    // --- Add a comment to a review ---
    @PostMapping("/{reviewId}/comments")
    public ResponseEntity<ReviewComment> addComment(
            @PathVariable Long reviewId,
            Authentication authentication,
            @RequestBody CommentRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(reviewService.addComment(reviewId, authentication.getName(), request.getContent()));
    }

    // --- Report a review ---
    @PostMapping("/{reviewId}/report")
    public ResponseEntity<Review> reportReview(@PathVariable Long reviewId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(reviewService.reportReview(reviewId));
    }

    @GetMapping("/check-eligibility/{bookId}")
    public ResponseEntity<java.util.Map<String, Object>> checkEligibility(@PathVariable Long bookId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(java.util.Map.of("eligible", false, "reason", "NOT_LOGGED_IN"));
        }
        java.util.Map<String, Object> result = reviewService.getReviewEligibilityReason(authentication.getName(), bookId);
        return ResponseEntity.ok(result);
    }

    // --- Get comments for a review ---
    @GetMapping("/{reviewId}/comments")
    public ResponseEntity<List<ReviewComment>> getComments(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.getComments(reviewId));
    }

    @Data
    public static class ReviewRequest {
        private Integer rating;
        private String comment;
        private String imageUrl;
    }

    @Data
    public static class CommentRequest {
        private String content;
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<java.util.Map<String, String>> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
    }
}
