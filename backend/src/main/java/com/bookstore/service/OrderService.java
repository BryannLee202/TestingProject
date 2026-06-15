package com.bookstore.service;

import com.bookstore.dto.OrderRequest;
import com.bookstore.entity.*;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final CartService cartService;
    private final CouponService couponService;

    public Order createOrder(String username, OrderRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"));
        
        double subtotal = 0;
        double shippingFee = request.getShippingFee() != null ? request.getShippingFee() : 0.0;

        Order order = Order.builder()
                .user(user)
                .status("PENDING")
                .items(new java.util.ArrayList<>())
                .shippingAddress(request.getShippingAddress())
                .phoneNumber(request.getPhoneNumber())
                .paymentMethod(request.getPaymentMethod())
                .shippingFee(shippingFee)
                .customerNote(request.getCustomerNote())
                .shippingStatus(ShippingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Book book = bookRepository.findById(itemReq.getBookId())
                    .orElseThrow(() -> new RuntimeException("Sách (ID: " + itemReq.getBookId() + ") không tồn tại hoặc đã ngừng kinh doanh. Vui lòng cập nhật lại giỏ hàng!"));
            
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .book(book)
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .build();
            
            order.getItems().add(orderItem);
            subtotal += itemReq.getPrice() * itemReq.getQuantity();
            
            // Trừ tồn kho
            if (book.getStockQuantity() >= itemReq.getQuantity()) {
                book.setStockQuantity(book.getStockQuantity() - itemReq.getQuantity());
                bookRepository.save(book);
            } else {
                throw new RuntimeException("Sách " + book.getTitle() + " không đủ số lượng tồn kho!");
            }
        }
        
        double discountAmount = 0.0;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            try {
                com.bookstore.entity.Coupon coupon = couponService.validateCoupon(request.getCouponCode(), subtotal);
                discountAmount = couponService.calculateDiscount(coupon, subtotal);
                order.setCouponCode(coupon.getCode());
                order.setDiscountAmount(discountAmount);
            } catch (Exception e) {
                throw new RuntimeException("Lỗi áp dụng mã giảm giá: " + e.getMessage());
            }
        }
        
        order.setTotalAmount(subtotal - discountAmount + shippingFee);
        
        // Xóa giỏ hàng sau khi đặt thành công
        cartService.clearCart(username);

        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"));
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));
    }

    public Order updateOrderShipping(Long orderId, String status, String shippingPartner, String trackingNumber) {
        Order order = getOrderById(orderId);
        if (status != null) {
            order.setShippingStatus(ShippingStatus.valueOf(status));
            // Đồng bộ trạng thái đơn hàng chung
            if (status.equals("DELIVERED")) {
                order.setStatus("COMPLETED");
            } else if (status.equals("CANCELLED")) {
                order.setStatus("CANCELLED");
            } else {
                order.setStatus("PROCESSING");
            }
        }
        if (shippingPartner != null) {
            order.setShippingPartner(shippingPartner);
        }
        if (trackingNumber != null) {
            order.setTrackingNumber(trackingNumber);
        }
        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy đơn hàng!");
        }
        orderRepository.deleteById(id);
    }
}
