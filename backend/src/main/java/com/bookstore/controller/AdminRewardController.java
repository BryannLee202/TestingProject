package com.bookstore.controller;

import com.bookstore.entity.RewardVoucher;
import com.bookstore.repository.RewardVoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/rewards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRewardController {

    private final RewardVoucherRepository rewardVoucherRepository;

    @GetMapping
    public ResponseEntity<List<RewardVoucher>> getAllVouchers() {
        return ResponseEntity.ok(rewardVoucherRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createVoucher(@RequestBody RewardVoucher voucher) {
        if (voucher.getCode() == null || voucher.getCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã không được để trống"));
        }
        if (rewardVoucherRepository.findByCode(voucher.getCode().trim()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã đã tồn tại"));
        }
        voucher.setCode(voucher.getCode().trim().toUpperCase());
        voucher.setIsActive(true);
        RewardVoucher saved = rewardVoucherRepository.save(voucher);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVoucher(@PathVariable Long id, @RequestBody RewardVoucher voucherDetails) {
        return rewardVoucherRepository.findById(id)
                .map(voucher -> {
                    voucher.setRewardValue(voucherDetails.getRewardValue());
                    voucher.setExpirationDate(voucherDetails.getExpirationDate());
                    voucher.setIsActive(voucherDetails.getIsActive());
                    return ResponseEntity.ok(rewardVoucherRepository.save(voucher));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        return rewardVoucherRepository.findById(id)
                .map(voucher -> {
                    rewardVoucherRepository.delete(voucher);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
