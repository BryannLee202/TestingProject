package com.bookstore.controller;

import com.bookstore.dto.OrderRequest;
import com.bookstore.dto.ReturnRequest;
import com.bookstore.entity.Order;
import com.bookstore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(Authentication authentication, @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrdersByUser(authentication.getName()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/shipping")
    public ResponseEntity<Order> updateOrderShipping(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String shippingPartner,
            @RequestParam(required = false) String trackingNumber) {
        return ResponseEntity.ok(orderService.updateOrderShipping(id, status, shippingPartner, trackingNumber));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(Authentication authentication, @PathVariable Long id) {
        orderService.userCancelOrder(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/payment-method")
    public ResponseEntity<Order> updatePaymentMethod(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam String method) {
        return ResponseEntity.ok(orderService.updatePaymentMethod(id, method, authentication.getName()));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<Void> returnOrder(Authentication authentication, @PathVariable Long id, @RequestBody(required = false) ReturnRequest request) {
        orderService.userReturnOrder(id, authentication.getName(), request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/confirm-received")
    public ResponseEntity<Void> confirmReceived(Authentication authentication, @PathVariable Long id) {
        orderService.confirmOrderReceived(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/return/approve")
    public ResponseEntity<Void> approveReturnOrder(@PathVariable Long id) {
        orderService.adminApproveReturn(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/return/reject")
    public ResponseEntity<Void> rejectReturnOrder(@PathVariable Long id) {
        orderService.adminRejectReturn(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteMultipleOrders(@RequestParam List<Long> ids) {
        orderService.deleteMultipleOrders(ids);
        return ResponseEntity.noContent().build();
    }
}
