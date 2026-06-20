package com.bookstore.controller;

import com.bookstore.entity.Review;
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
        Review review = reviewService.createReview(username, bookId, request.getRating(), request.getComment());
        return ResponseEntity.ok(review);
    }

    @Data
    public static class ReviewRequest {
        private Integer rating;
        private String comment;
    }
}
