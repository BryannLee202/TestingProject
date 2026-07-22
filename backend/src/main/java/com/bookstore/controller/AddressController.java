package com.bookstore.controller;

import com.bookstore.entity.Address;
import com.bookstore.entity.User;
import com.bookstore.repository.AddressRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByUsername(auth.getName()).orElse(null);
    }

    @GetMapping("/my-addresses")
    public ResponseEntity<?> getMyAddresses(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Address> addresses = addressRepository.findByUserId(user.getId());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping
    public ResponseEntity<?> addAddress(@RequestBody Address address, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        address.setUser(user);
        
        // Check if this is the first address
        List<Address> existing = addressRepository.findByUserId(user.getId());
        if (existing.isEmpty() || address.isDefault()) {
            // Set others to non-default
            existing.forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
            address.setDefault(true);
        }

        Address saved = addressRepository.save(address);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Address> opt = addressRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }

        // Set all to false
        List<Address> existing = addressRepository.findByUserId(user.getId());
        existing.forEach(a -> {
            a.setDefault(false);
            addressRepository.save(a);
        });

        Address target = opt.get();
        target.setDefault(true);
        addressRepository.save(target);

        return ResponseEntity.ok(Map.of("message", "Đã đặt làm địa chỉ mặc định"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody Address updatedAddress, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Address> opt = addressRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }

        Address existing = opt.get();
        existing.setRecipientName(updatedAddress.getRecipientName());
        existing.setPhone(updatedAddress.getPhone());
        existing.setCity(updatedAddress.getCity());
        existing.setWard(updatedAddress.getWard());
        existing.setStreet(updatedAddress.getStreet());
        
        if (updatedAddress.isDefault() && !existing.isDefault()) {
            List<Address> all = addressRepository.findByUserId(user.getId());
            all.forEach(a -> {
                if (!a.getId().equals(existing.getId())) {
                    a.setDefault(false);
                    addressRepository.save(a);
                }
            });
            existing.setDefault(true);
        }

        Address saved = addressRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Address> opt = addressRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }

        Address address = opt.get();
        addressRepository.delete(address);

        // If we deleted the default address, and there are others left, make the first one default
        if (address.isDefault()) {
            List<Address> remaining = addressRepository.findByUserId(user.getId());
            if (!remaining.isEmpty()) {
                Address first = remaining.get(0);
                first.setDefault(true);
                addressRepository.save(first);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Đã xóa địa chỉ"));
    }
}
