package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Review;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.ReviewRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public List<Review> getReviewsByBookId(Long bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    public List<Review> getReviewsByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Review createReview(String username, Long bookId, Integer rating, String comment) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách!"));

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Đánh giá phải từ 1 đến 5 sao!");
        }

        Review review = Review.builder()
                .user(user)
                .book(book)
                .rating(rating)
                .comment(comment)
                .createdAt(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update book's average rating and review count
        int count = book.getReviewCount() != null ? book.getReviewCount() : 0;
        double currentAvg = book.getAverageRating() != null ? book.getAverageRating() : 0.0;
        
        double newAvg = ((currentAvg * count) + rating) / (count + 1);
        
        book.setReviewCount(count + 1);
        book.setAverageRating(Math.round(newAvg * 10.0) / 10.0);
        bookRepository.save(book);

        return savedReview;
    }
}
