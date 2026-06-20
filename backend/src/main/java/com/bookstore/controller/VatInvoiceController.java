package com.bookstore.controller;

import com.bookstore.entity.User;
import com.bookstore.entity.VatInvoice;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.VatInvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/vat-invoices")
public class VatInvoiceController {

    @Autowired
    private VatInvoiceRepository vatInvoiceRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByUsername(auth.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> getMyVatInvoice(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<VatInvoice> opt = vatInvoiceRepository.findByUserId(user.getId());
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        }
        return ResponseEntity.ok().build(); // Return 200 OK with no body if empty
    }

    @PostMapping
    public ResponseEntity<?> saveVatInvoice(@RequestBody VatInvoice invoice, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<VatInvoice> existingOpt = vatInvoiceRepository.findByUserId(user.getId());
        VatInvoice toSave;
        
        if (existingOpt.isPresent()) {
            toSave = existingOpt.get();
            toSave.setType(invoice.getType());
            toSave.setCompanyName(invoice.getCompanyName());
            toSave.setCompanyAddress(invoice.getCompanyAddress());
            toSave.setTaxCode(invoice.getTaxCode());
            toSave.setEmail(invoice.getEmail());
        } else {
            toSave = invoice;
            toSave.setUser(user);
        }

        VatInvoice saved = vatInvoiceRepository.save(toSave);
        return ResponseEntity.ok(saved);
    }
}
