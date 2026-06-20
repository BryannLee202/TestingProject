package com.bookstore.repository;

import com.bookstore.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Wishlist> findByUserIdAndBookId(Long userId, Long bookId);
}
