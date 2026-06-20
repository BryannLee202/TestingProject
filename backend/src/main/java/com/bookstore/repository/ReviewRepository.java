package com.bookstore.repository;

import com.bookstore.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBookIdOrderByCreatedAtDesc(Long bookId);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
}
