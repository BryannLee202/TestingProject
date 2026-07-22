package com.bookstore.controller;

import com.bookstore.dto.CartRequest;
import com.bookstore.entity.Cart;
import com.bookstore.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCartByUser(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Cart> addToCart(Authentication authentication, @RequestBody CartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(authentication.getName(), request));
    }

    @PutMapping("/{bookId}")
    public ResponseEntity<Cart> updateCartItem(
            Authentication authentication,
            @PathVariable Long bookId,
            @RequestBody CartRequest request) {
        return ResponseEntity.ok(cartService.updateCartItem(authentication.getName(), bookId, request));
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<Cart> removeCartItem(Authentication authentication, @PathVariable Long bookId) {
        return ResponseEntity.ok(cartService.removeCartItem(authentication.getName(), bookId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.ok().build();
    }
}
