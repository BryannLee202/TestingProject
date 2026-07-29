package com.bookstore.service;

import com.bookstore.dto.CartRequest;
import com.bookstore.entity.Book;
import com.bookstore.entity.Cart;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    private User testUser;
    private Cart testCart;
    private Book testBook;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("cartuser")
                .build();

        testCart = Cart.builder()
                .id(10L)
                .user(testUser)
                .items(new ArrayList<>())
                .build();

        testBook = Book.builder()
                .id(100L)
                .title("Tối Ưu Hóa Code")
                .build();
    }

    @Test
    void getCartByUser_ExistingCart() {
        when(userRepository.findByUsername("cartuser")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));

        Cart cart = cartService.getCartByUser("cartuser");

        assertNotNull(cart);
        assertEquals(10L, cart.getId());
    }

    @Test
    void addToCart_NewItem() {
        CartRequest request = new CartRequest();
        request.setBookId(100L);
        request.setQuantity(2);

        when(userRepository.findByUsername("cartuser")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(bookRepository.findById(100L)).thenReturn(Optional.of(testBook));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cart result = cartService.addToCart("cartuser", request);

        assertEquals(1, result.getItems().size());
        assertEquals(2, result.getItems().get(0).getQuantity());
        assertEquals(testBook, result.getItems().get(0).getBook());
    }

    @Test
    void addToCart_ExistingItem_IncrementsQuantity() {
        CartItem existingItem = CartItem.builder()
                .id(50L)
                .cart(testCart)
                .book(testBook)
                .quantity(1)
                .build();
        testCart.getItems().add(existingItem);

        CartRequest request = new CartRequest();
        request.setBookId(100L);
        request.setQuantity(3);

        when(userRepository.findByUsername("cartuser")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(bookRepository.findById(100L)).thenReturn(Optional.of(testBook));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cart result = cartService.addToCart("cartuser", request);

        assertEquals(1, result.getItems().size());
        assertEquals(4, result.getItems().get(0).getQuantity());
    }

    @Test
    void removeCartItem_Success() {
        CartItem item = CartItem.builder().id(50L).cart(testCart).book(testBook).quantity(2).build();
        testCart.getItems().add(item);

        when(userRepository.findByUsername("cartuser")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cart result = cartService.removeCartItem("cartuser", 100L);

        assertTrue(result.getItems().isEmpty());
    }

    @Test
    void clearCart_Success() {
        CartItem item = CartItem.builder().id(50L).cart(testCart).book(testBook).quantity(2).build();
        testCart.getItems().add(item);

        when(userRepository.findByUsername("cartuser")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));

        cartService.clearCart("cartuser");

        assertTrue(testCart.getItems().isEmpty());
        verify(cartRepository).save(testCart);
    }
}
