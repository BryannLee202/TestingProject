package com.bookstore.repository;

import com.bookstore.entity.VatInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VatInvoiceRepository extends JpaRepository<VatInvoice, Long> {
    Optional<VatInvoice> findByUserId(Long userId);
}
