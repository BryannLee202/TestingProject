package com.bookstore.controller;

import com.bookstore.entity.Contact;
import com.bookstore.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<?> createContact(@RequestBody Contact contact) {
        try {
            Contact savedContact = contactService.createContact(contact);
            return ResponseEntity.ok(Map.of("message", "Gửi thông tin liên hệ/góp ý thành công!", "data", savedContact));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Đã xảy ra lỗi hệ thống khi lưu góp ý."));
        }
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllContacts() {
        try {
            return ResponseEntity.ok(contactService.getAllContacts());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi lấy danh sách góp ý."));
        }
    }

    @PutMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateContactStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.getOrDefault("status", "PROCESSED");
            Contact updated = contactService.updateContactStatus(id, status);
            return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái góp ý thành công!", "data", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi khi cập nhật trạng thái góp ý."));
        }
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteContact(@PathVariable Long id) {
        try {
            contactService.deleteContact(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa góp ý thành công."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi khi xóa góp ý."));
        }
    }
}
