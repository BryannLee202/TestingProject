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
    private final CouponRepository couponRepository;

    private void updatePointsAndSpent(User user, double orderTotal, boolean isFirstOrder) {
        if (user.getTotalSpent() == null) user.setTotalSpent(0.0);
        if (user.getYPoints() == null) user.setYPoints(0);
        if (user.getAccumulatedPoints() == null) user.setAccumulatedPoints(0);

        double rate = 0.005; // Đồng/Mặc định 0.5%
        int userAcc = user.getAccumulatedPoints();
        if (userAcc >= 100000) {
            rate = 0.02; // Kim Cương 2%
        } else if (userAcc >= 30000) {
            rate = 0.01; // Vàng 1%
        } else if (userAcc >= 5000) {
            rate = 0.005; // Bạc 0.5%
        }
        
        int earnedPoints = (int) (orderTotal * rate);
        if (isFirstOrder) {
            earnedPoints += 20000;
        }

        int oldBalance = user.getYPoints();
        int newBalance = oldBalance + earnedPoints;
        
        user.setTotalSpent(user.getTotalSpent() + orderTotal);
        user.setAccumulatedPoints(userAcc + earnedPoints);
        user.setYPoints(newBalance);
        userRepository.save(user);

        // Log transaction for earning points
        PointTransaction earnTx = PointTransaction.builder()
                .user(user)
                .action("EARN_ORDER")
                .description(isFirstOrder ? "Thưởng hóa đơn mua hàng + 20K điểm đơn đầu" : "Điểm thưởng từ hóa đơn mua hàng")
                .previousBalance(oldBalance)
                .transactionValue(earnedPoints)
                .newBalance(newBalance)
                .createdAt(LocalDateTime.now())
                .build();
        pointTransactionRepository.save(earnTx);

        if (isFirstOrder) {
            com.bookstore.entity.Coupon freeship = com.bookstore.entity.Coupon.builder()
                    .code("FREESHIP_NEW_" + System.currentTimeMillis())
                    .discountType(com.bookstore.entity.DiscountType.PERCENTAGE)
                    .discountValue(100.0) // 100% freeship
                    .minOrderAmount(0.0)
                    .expirationDate(LocalDateTime.now().plusYears(1))
                    .isActive(true)
                    .build();
            couponRepository.save(freeship);
        }
    }

    public Order createOrder(String username, OrderRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"));
        
        boolean isFirstOrder = orderRepository.findByUserOrderByCreatedAtDesc(user).isEmpty();

        double subtotal = 0;
        double totalOldPrice = 0;
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
            
            double oldP = book.getOldPrice() != null ? book.getOldPrice().doubleValue() : book.getPrice().doubleValue();
            totalOldPrice += oldP * itemReq.getQuantity();
            
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
        double maxAllowedDiscount = totalOldPrice * 0.5;
        double currentProductDiscount = totalOldPrice - subtotal;
        double remainingMaxDiscount = Math.max(0, maxAllowedDiscount - currentProductDiscount);
        
        // Tính chiết khấu VIP
        double vipDiscountRate = 0.0;
        double userAcc = user.getAccumulatedPoints() != null ? user.getAccumulatedPoints() : 0.0;
        if (userAcc >= 100000) {
            vipDiscountRate = 0.10; // Kim Cương
        } else if (userAcc >= 30000) {
            vipDiscountRate = 0.05; // Vàng
        } else if (userAcc >= 5000) {
            vipDiscountRate = 0.02; // Bạc
        }
        
        double vipDiscountAmount = subtotal * vipDiscountRate;
        if (vipDiscountAmount > remainingMaxDiscount) {
            vipDiscountAmount = remainingMaxDiscount > 0 ? remainingMaxDiscount : 0;
        }
        discountAmount += vipDiscountAmount;
        remainingMaxDiscount -= vipDiscountAmount;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            try {
                com.bookstore.entity.Coupon coupon = couponService.validateCoupon(request.getCouponCode(), subtotal);
                double couponDiscount = couponService.calculateDiscount(coupon, subtotal);
                
                if (couponDiscount > remainingMaxDiscount) {
                    couponDiscount = remainingMaxDiscount > 0 ? remainingMaxDiscount : 0;
                }
                
                discountAmount += couponDiscount;
                remainingMaxDiscount -= couponDiscount;
                order.setCouponCode(coupon.getCode());
            } catch (Exception e) {
                throw new RuntimeException("Lỗi áp dụng mã giảm giá: " + e.getMessage());
            }
        }
        
        order.setDiscountAmount(discountAmount);
        
        // Handling Y-Points spending
        int pointsUsed = 0;
        if (request.getSpentPoints() != null && request.getSpentPoints() > 0) {
            if (user.getYPoints() == null || user.getYPoints() < request.getSpentPoints()) {
                throw new RuntimeException("Bạn không đủ Y-Point để thanh toán!");
            }
            pointsUsed = request.getSpentPoints();
            
            // 1 Y-Point = 1 VND
            double pointsDiscount = pointsUsed;
            // Prevent discount from exceeding total and max remaining discount cap
            double maxPointsByRule = remainingMaxDiscount > 0 ? remainingMaxDiscount : 0;
            double maxPointsByTotal = subtotal - discountAmount + shippingFee;
            double actualMaxPoints = Math.min(maxPointsByRule, maxPointsByTotal);

            if (pointsDiscount > actualMaxPoints) {
                pointsDiscount = actualMaxPoints;
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
        updatePointsAndSpent(user, savedOrder.getTotalAmount(), isFirstOrder);
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
