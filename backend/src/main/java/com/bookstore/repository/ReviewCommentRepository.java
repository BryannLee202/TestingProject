package com.bookstore.repository;

import com.bookstore.entity.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {
    List<ReviewComment> findByReviewIdOrderByCreatedAtAsc(Long reviewId);
}
