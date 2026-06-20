package com.bookstore.repository;

import com.bookstore.entity.UserReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRewardRepository extends JpaRepository<UserReward, Long> {
    boolean existsByUserIdAndVoucherId(Long userId, Long voucherId);
}
