package com.bookstore.service;

import com.bookstore.entity.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final NotificationRepository notificationRepository;

    public List<Review> getReviewsByBookId(Long bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    public List<Review> getReviewsByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public Review createReview(String username, Long bookId, Integer rating, String comment, String imageUrl) {
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
                .imageUrl(imageUrl)
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

        // Reward points
        int pointsEarned = 200; // Base points for rating
        if (comment != null && !comment.trim().isEmpty()) {
            pointsEarned += 200; // Extra points for comment
        }
        
        int oldBalance = user.getYPoints() == null ? 0 : user.getYPoints();
        int newBalance = oldBalance + pointsEarned;
        
        user.setYPoints(newBalance);
        userRepository.save(user);
        
        PointTransaction pt = PointTransaction.builder()
                .user(user)
                .action("EARN_REVIEW")
                .description("Đánh giá sản phẩm: " + book.getTitle())
                .previousBalance(oldBalance)
                .transactionValue(pointsEarned)
                .newBalance(newBalance)
                .createdAt(LocalDateTime.now())
                .build();
        pointTransactionRepository.save(pt);

        return savedReview;
    }
    public List<Review> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá!"));
        
        Book book = review.getBook();
        int count = book.getReviewCount() != null ? book.getReviewCount() : 0;
        double currentAvg = book.getAverageRating() != null ? book.getAverageRating() : 0.0;
        
        if (count > 1) {
            double newAvg = ((currentAvg * count) - review.getRating()) / (count - 1);
            book.setReviewCount(count - 1);
            book.setAverageRating(Math.round(newAvg * 10.0) / 10.0);
        } else {
            book.setReviewCount(0);
            book.setAverageRating(0.0);
        }
        bookRepository.save(book);

        reviewRepository.delete(review);
    }

    @Transactional
    public Review updateReview(Long id, String comment, Integer rating) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá!"));

        if (rating != null && !rating.equals(review.getRating())) {
            Book book = review.getBook();
            int count = book.getReviewCount() != null ? book.getReviewCount() : 1;
            double currentAvg = book.getAverageRating() != null ? book.getAverageRating() : 0.0;
            
            double sumWithoutOld = (currentAvg * count) - review.getRating();
            double newAvg = (sumWithoutOld + rating) / count;
            
            book.setAverageRating(Math.round(newAvg * 10.0) / 10.0);
            bookRepository.save(book);
            
            review.setRating(rating);
        }

        if (comment != null) {
            review.setComment(comment);
        }

        return reviewRepository.save(review);
    }

    @Transactional
    public Review likeReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá!"));
        int current = review.getLikesCount() == null ? 0 : review.getLikesCount();
        review.setLikesCount(current + 1);
        return reviewRepository.save(review);
    }

    @Transactional
    public ReviewComment addComment(Long reviewId, String username, String content) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá!"));
        User commenter = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        ReviewComment rc = ReviewComment.builder()
                .review(review)
                .user(commenter)
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
        ReviewComment saved = reviewCommentRepository.save(rc);

        // Trigger notification to review owner if different user
        if (!review.getUser().getId().equals(commenter.getId())) {
            Notification notification = Notification.builder()
                    .title("Bình luận mới trên đánh giá của bạn")
                    .content(commenter.getFullName() + " đã phản hồi đánh giá của bạn: \"" + content.substring(0, Math.min(content.length(), 80)) + "\"")
                    .type("REVIEW_COMMENT")
                    .userId(review.getUser().getId())
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notification);
        }

        return saved;
    }

    public List<ReviewComment> getComments(Long reviewId) {
        return reviewCommentRepository.findByReviewIdOrderByCreatedAtAsc(reviewId);
    }
}
