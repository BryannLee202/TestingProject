package com.bookstore.repository;

import com.bookstore.entity.OtpStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpStoreRepository extends JpaRepository<OtpStore, Long> {

    Optional<OtpStore> findTopByKeyAndUsedFalseOrderByExpiresAtDesc(String key);

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpStore o WHERE o.expiresAt < :now")
    void deleteExpired(LocalDateTime now);
}
