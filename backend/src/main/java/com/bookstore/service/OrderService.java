package com.bookstore.service;

import com.bookstore.dto.OrderRequest;
import com.bookstore.entity.*;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.PointTransactionRepository;
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
    private final PointTransactionRepository pointTransactionRepository;

    private void updatePointsAndSpent(User user, double orderTotal) {
        if (user.getTotalSpent() == null) user.setTotalSpent(0.0);
        if (user.getYPoints() == null) user.setYPoints(0);

        double rate = 0.005; // Bạc 0.5%
        if (user.getYPoints() >= 100000) {
            rate = 0.02; // Kim Cương 2%
        } else if (user.getYPoints() >= 30000) {
            rate = 0.01; // Vàng 1%
        }
        
        int earnedPoints = (int) (orderTotal * rate);
        int oldBalance = user.getYPoints();
        int newBalance = oldBalance + earnedPoints;
        
        user.setTotalSpent(user.getTotalSpent() + orderTotal);
        user.setYPoints(newBalance);
        userRepository.save(user);

        // Log transaction for earning points
        PointTransaction earnTx = PointTransaction.builder()
                .user(user)
                .action("EARN_ORDER")
                .description("Điểm thưởng từ hóa đơn mua hàng")
                .previousBalance(oldBalance)
                .transactionValue(earnedPoints)
                .newBalance(newBalance)
                .createdAt(LocalDateTime.now())
                .build();
        pointTransactionRepository.save(earnTx);
    }

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
            
            // Trừ tồn kho và tăng số lượng đã bán
            if (book.getStockQuantity() >= itemReq.getQuantity()) {
                book.setStockQuantity(book.getStockQuantity() - itemReq.getQuantity());
                
                int currentSales = book.getSalesCount() == null ? 0 : book.getSalesCount();
                book.setSalesCount(currentSales + itemReq.getQuantity());
                
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
        
        // Handling Y-Points spending
        int pointsUsed = 0;
        if (request.getSpentPoints() != null && request.getSpentPoints() > 0) {
            if (user.getYPoints() == null || user.getYPoints() < request.getSpentPoints()) {
                throw new RuntimeException("Bạn không đủ Y-Point để thanh toán!");
            }
            pointsUsed = request.getSpentPoints();
            
            // 1 Y-Point = 1 VND
            double pointsDiscount = pointsUsed;
            // Prevent discount from exceeding total
            if (pointsDiscount > (subtotal - discountAmount + shippingFee)) {
                pointsDiscount = subtotal - discountAmount + shippingFee;
                pointsUsed = (int) pointsDiscount;
            }
            
            int oldBalance = user.getYPoints();
            int newBalance = oldBalance - pointsUsed;
            user.setYPoints(newBalance);
            userRepository.save(user);
            
            order.setPointsUsed(pointsUsed);
            
            // Log transaction for spending points
            PointTransaction spendTx = PointTransaction.builder()
                    .user(user)
                    .action("SPEND_ORDER")
                    .description("Thanh toán dùng điểm")
                    .previousBalance(oldBalance)
                    .transactionValue(-pointsUsed)
                    .newBalance(newBalance)
                    .createdAt(LocalDateTime.now())
                    .build();
            pointTransactionRepository.save(spendTx);
        }
        
        order.setTotalAmount(subtotal - discountAmount - pointsUsed + shippingFee);
        
        // Xóa giỏ hàng sau khi đặt thành công
        cartService.clearCart(username);

        Order savedOrder = orderRepository.save(order);
        updatePointsAndSpent(user, savedOrder.getTotalAmount());
        return savedOrder;
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

    public void deleteMultipleOrders(List<Long> ids) {
        orderRepository.deleteAllById(ids);
    }
}
