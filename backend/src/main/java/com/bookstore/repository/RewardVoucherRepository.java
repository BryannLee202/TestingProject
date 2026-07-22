package com.bookstore.repository;

import com.bookstore.entity.RewardVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RewardVoucherRepository extends JpaRepository<RewardVoucher, Long> {
    Optional<RewardVoucher> findByCode(String code);
}
