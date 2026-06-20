package com.bookstore.controller;

import com.bookstore.entity.Book;
import com.bookstore.entity.User;
import com.bookstore.entity.Wishlist;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/wishlists")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByUsername(auth.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> getMyWishlist(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Wishlist> list = wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/book/{bookId}")
    public ResponseEntity<?> toggleWishlist(@PathVariable Long bookId, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Book> bookOpt = bookRepository.findById(bookId);
        if (bookOpt.isEmpty()) return ResponseEntity.notFound().build();

        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndBookId(user.getId(), bookId);
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("message", "Đã xóa khỏi danh sách yêu thích", "isLiked", false));
        } else {
            Wishlist wl = Wishlist.builder()
                    .user(user)
                    .book(bookOpt.get())
                    .build();
            wishlistRepository.save(wl);
            return ResponseEntity.ok(Map.of("message", "Đã thêm vào danh sách yêu thích", "isLiked", true));
        }
    }
}
