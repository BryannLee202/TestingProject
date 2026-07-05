package com.bookstore.service;

import com.bookstore.entity.Contact;
import com.bookstore.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactService {

    private final ContactRepository contactRepository;

    @Transactional
    public Contact createContact(Contact contact) {
        if (contact.getFullName() == null || contact.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Họ tên không được để trống.");
        }
        if (contact.getEmail() == null || contact.getEmail().trim().isEmpty() || !contact.getEmail().contains("@")) {
            throw new IllegalArgumentException("Email không hợp lệ.");
        }
        if (contact.getContent() == null || contact.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung góp ý không được để trống.");
        }
        
        contact.setFullName(contact.getFullName().trim());
        contact.setEmail(contact.getEmail().trim().toLowerCase());
        contact.setContent(contact.getContent().trim());
        if (contact.getPhone() != null) {
            contact.setPhone(contact.getPhone().trim());
        }
        
        return contactRepository.save(contact);
    }

    public List<Contact> getAllContacts() {
        return contactRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Contact updateContactStatus(Long id, String status) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy góp ý với ID: " + id));
        contact.setStatus(status);
        return contactRepository.save(contact);
    }

    @Transactional
    public void deleteContact(Long id) {
        if (!contactRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy góp ý với ID: " + id);
        }
        contactRepository.deleteById(id);
    }
}
