package com.bookstore.service;

import com.bookstore.dto.OrderRequest;
import com.bookstore.dto.ReturnRequest;
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

        String initialStatus = "VNPAY".equalsIgnoreCase(request.getPaymentMethod()) ? "PENDING_PAYMENT" : "PENDING";

        Order order = Order.builder()
                .user(user)
                .status(initialStatus)
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

        com.bookstore.entity.Coupon discountCoupon = null;
        if (request.getDiscountCouponCode() != null && !request.getDiscountCouponCode().trim().isEmpty()) {
            try {
                discountCoupon = couponService.validateCoupon(request.getDiscountCouponCode(), subtotal, username);
                if (!"DISCOUNT".equals(discountCoupon.getCategory()) && discountCoupon.getCategory() != null) {
                    throw new RuntimeException("Mã này không phải mã giảm giá sản phẩm!");
                }
                double couponDiscount = couponService.calculateDiscount(discountCoupon, subtotal);
                
                if (couponDiscount > remainingMaxDiscount) {
                    couponDiscount = remainingMaxDiscount > 0 ? remainingMaxDiscount : 0;
                }
                
                discountAmount += couponDiscount;
                remainingMaxDiscount -= couponDiscount;
                order.setDiscountCouponCode(discountCoupon.getCode());
            } catch (Exception e) {
                throw new RuntimeException("Lỗi áp dụng mã giảm giá: " + e.getMessage());
            }
        }

        double shippingDiscount = 0;
        com.bookstore.entity.Coupon shippingCoupon = null;
        if (request.getShippingCouponCode() != null && !request.getShippingCouponCode().trim().isEmpty()) {
            try {
                shippingCoupon = couponService.validateCoupon(request.getShippingCouponCode(), subtotal, username);
                boolean isShipping = "SHIPPING".equals(shippingCoupon.getCategory()) || 
                                     (shippingCoupon.getCategory() == null && shippingCoupon.getCode().toUpperCase().contains("FREESHIP"));
                if (!isShipping && shippingCoupon.getCategory() != null) {
                    throw new RuntimeException("Mã này không phải mã miễn phí vận chuyển!");
                } else if (!isShipping && shippingCoupon.getCategory() == null) {
                    // It's null category and not a FREESHIP code, so maybe it's a discount coupon mistakenly used as shipping
                    throw new RuntimeException("Mã này không phải mã miễn phí vận chuyển!");
                }
                double calcShipDiscount = couponService.calculateDiscount(shippingCoupon, shippingFee);
                
                // Tiền giảm vận chuyển không được vượt quá phí vận chuyển
                shippingDiscount = Math.min(calcShipDiscount, shippingFee);
                order.setShippingCouponCode(shippingCoupon.getCode());
            } catch (Exception e) {
                throw new RuntimeException("Lỗi áp dụng mã vận chuyển: " + e.getMessage());
            }
        }
        
        order.setDiscountAmount(discountAmount + shippingDiscount);
        
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
        order.setTotalAmount(subtotal - discountAmount - pointsUsed + shippingFee - shippingDiscount);
        
        Order savedOrder = orderRepository.save(order);

        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
                cartService.removeCartItem(username, itemReq.getBookId());
            }
            if (discountCoupon != null) couponService.useCoupon(discountCoupon);
            if (shippingCoupon != null) couponService.useCoupon(shippingCoupon);
        }

        return savedOrder;
    }

    public void confirmVNPayPayment(Long orderId, boolean success) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (!"PENDING_PAYMENT".equals(order.getStatus())) {
            return;
        }

        User user = order.getUser();

        if (success) {
            order.setStatus("PENDING");
            orderRepository.save(order);

            for (com.bookstore.entity.OrderItem item : order.getItems()) {
                cartService.removeCartItem(user.getUsername(), item.getBook().getId());
            }

            if (order.getDiscountCouponCode() != null && !order.getDiscountCouponCode().isEmpty()) {
                couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(order.getDiscountCouponCode())
                        .ifPresent(couponService::useCoupon);
            }
            if (order.getShippingCouponCode() != null && !order.getShippingCouponCode().isEmpty()) {
                couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(order.getShippingCouponCode())
                        .ifPresent(couponService::useCoupon);
            }

        } else {
            order.setStatus("CANCELLED");
            orderRepository.save(order);
            
            // Hoàn điểm
            if (order.getPointsUsed() != null && order.getPointsUsed() > 0) {
                user.setYPoints(user.getYPoints() + order.getPointsUsed());
                userRepository.save(user);
                
                PointTransaction pt = PointTransaction.builder()
                        .user(user)
                        .action("REFUND_ORDER")
                        .description("Hoàn điểm do huỷ thanh toán VNPAY")
                        .previousBalance(user.getYPoints() - order.getPointsUsed())
                        .transactionValue(order.getPointsUsed())
                        .newBalance(user.getYPoints())
                        .createdAt(java.time.LocalDateTime.now())
                        .build();
                pointTransactionRepository.save(pt);
            }
            
            // Hoàn tồn kho
            for (com.bookstore.entity.OrderItem item : order.getItems()) {
                com.bookstore.entity.Book book = item.getBook();
                book.setStockQuantity(book.getStockQuantity() + item.getQuantity());
                book.setSalesCount(Math.max(0, (book.getSalesCount() == null ? 0 : book.getSalesCount()) - item.getQuantity()));
                bookRepository.save(book);
            }
        }
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
        boolean wasNotCompleted = !"COMPLETED".equals(order.getStatus());

        if (status != null) {
            order.setShippingStatus(ShippingStatus.valueOf(status));
            // Đồng bộ trạng thái đơn hàng chung
            if (status.equals("DELIVERED")) {
                order.setStatus("SHIPPED");
            } else if (status.equals("CANCELLED")) {
                order.setStatus("CANCELLED");
            } else if (status.equals("SHIPPING")) {
                order.setStatus("SHIPPED");
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

    public void confirmOrderReceived(Long orderId, String username) {
        Order order = getOrderById(orderId);
        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Bạn không có quyền thao tác đơn hàng này!");
        }
        if ("COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã được xác nhận hoàn thành!");
        }

        order.setStatus("COMPLETED");
        
        // Update points
        User user = order.getUser();
        boolean isFirstOrder = orderRepository.findByUserOrderByCreatedAtDesc(user).size() <= 1;
        updatePointsAndSpent(user, order.getTotalAmount(), isFirstOrder);

        orderRepository.save(order);
    }

    public void userCancelOrder(Long orderId, String username) {
        Order order = getOrderById(orderId);
        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Bạn không có quyền huỷ đơn hàng này!");
        }
        if (order.getShippingStatus() != ShippingStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể huỷ đơn hàng khi người bán chưa xác nhận giao hàng!");
        }

        if (!"COD".equalsIgnoreCase(order.getPaymentMethod()) && !"PENDING_PAYMENT".equals(order.getStatus())) {
            // Paid online -> need refund
            order.setStatus("REFUNDED"); // In a real app, this goes to REFUND_PENDING. Here we just set it to REFUNDED to indicate money returned.
        } else {
            order.setStatus("CANCELLED");
        }
        order.setShippingStatus(ShippingStatus.CANCELLED);
        orderRepository.save(order);

        User user = order.getUser();

        // Hoàn điểm
        if (order.getPointsUsed() != null && order.getPointsUsed() > 0) {
            user.setYPoints(user.getYPoints() + order.getPointsUsed());
            userRepository.save(user);

            PointTransaction pt = PointTransaction.builder()
                    .user(user)
                    .action("REFUND_ORDER")
                    .description("Hoàn điểm do huỷ đơn hàng")
                    .previousBalance(user.getYPoints() - order.getPointsUsed())
                    .transactionValue(order.getPointsUsed())
                    .newBalance(user.getYPoints())
                    .createdAt(java.time.LocalDateTime.now())
                    .build();
            pointTransactionRepository.save(pt);
        }

        // Hoàn tồn kho
        for (com.bookstore.entity.OrderItem item : order.getItems()) {
            com.bookstore.entity.Book book = item.getBook();
            book.setStockQuantity(book.getStockQuantity() + item.getQuantity());
            book.setSalesCount(Math.max(0, (book.getSalesCount() == null ? 0 : book.getSalesCount()) - item.getQuantity()));
            bookRepository.save(book);
        }
    }

    public void userReturnOrder(Long orderId, String username, ReturnRequest returnRequest) {
        Order order = getOrderById(orderId);
        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Bạn không có quyền thao tác đơn hàng này!");
        }
        if (!"COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể yêu cầu trả hàng/hoàn tiền cho đơn hàng đã hoàn thành!");
        }

        order.setStatus("RETURNED");
        
        if (returnRequest != null) {
            order.setReturnReason(returnRequest.getReason());
            order.setReturnPhone(returnRequest.getPhone());
            order.setReturnBank(returnRequest.getBank());
            order.setReturnDetails(returnRequest.getDetails());
        }

        orderRepository.save(order);
    }

    public void adminApproveReturn(Long orderId) {
        Order order = getOrderById(orderId);
        if (!"RETURNED".equals(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể duyệt đơn hàng đang yêu cầu trả hàng!");
        }
        order.setStatus("REFUNDED");
        orderRepository.save(order);
    }

    public void adminRejectReturn(Long orderId) {
        Order order = getOrderById(orderId);
        if (!"RETURNED".equals(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể từ chối đơn hàng đang yêu cầu trả hàng!");
        }
        order.setStatus("COMPLETED");
        order.setShippingStatus(ShippingStatus.DELIVERED);
        
        // Xóa thông tin yêu cầu trả hàng
        order.setReturnReason(null);
        order.setReturnPhone(null);
        order.setReturnBank(null);
        order.setReturnDetails(null);
        
        orderRepository.save(order);
    }

    public Order updatePaymentMethod(Long orderId, String newMethod, String username) {
        Order order = getOrderById(orderId);
        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Bạn không có quyền thao tác đơn hàng này!");
        }
        if (!"PENDING_PAYMENT".equals(order.getStatus()) && !"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Không thể thay đổi phương thức thanh toán cho đơn hàng ở trạng thái này!");
        }

        order.setPaymentMethod(newMethod);

        if ("COD".equalsIgnoreCase(newMethod)) {
            order.setStatus("PENDING");
            
            // Remove items from user's cart since the order is now placed with COD
            for (com.bookstore.entity.OrderItem item : order.getItems()) {
                cartService.removeCartItem(username, item.getBook().getId());
            }

            // Apply coupons if any
            if (order.getDiscountCouponCode() != null && !order.getDiscountCouponCode().isEmpty()) {
                couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(order.getDiscountCouponCode())
                        .ifPresent(couponService::useCoupon);
            }
            if (order.getShippingCouponCode() != null && !order.getShippingCouponCode().isEmpty()) {
                couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(order.getShippingCouponCode())
                        .ifPresent(couponService::useCoupon);
            }
        } else {
            order.setStatus("PENDING_PAYMENT");
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
