package com.bookstore.service;

import com.bookstore.dto.OrderRequest;
import com.bookstore.entity.Book;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final CartService cartService;

    public Order createOrder(String username, OrderRequest request) {
        User user = userRepository.findByUsername(username).orElseThrow();
        
        double totalAmount = 0;
        Order order = Order.builder()
                .user(user)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Book book = bookRepository.findById(itemReq.getBookId()).orElseThrow();
            
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .book(book)
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .build();
            
            order.getItems().add(orderItem);
            totalAmount += itemReq.getPrice() * itemReq.getQuantity();
            
            // Trừ tồn kho
            if (book.getStockQuantity() >= itemReq.getQuantity()) {
                book.setStockQuantity(book.getStockQuantity() - itemReq.getQuantity());
            } else {
                throw new RuntimeException("Sách " + book.getTitle() + " không đủ số lượng tồn kho!");
            }
        }
        
        order.setTotalAmount(totalAmount);
        
        // Xóa giỏ hàng sau khi đặt thành công
        cartService.clearCart(username);

        return orderRepository.save(order);
    }
}
