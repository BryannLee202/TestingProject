package com.bookstore.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private List<OrderItemRequest> items;
    private String shippingAddress;
    private String phoneNumber;
    private String paymentMethod;
    private Double shippingFee;
    private String customerNote;
    private String couponCode;

    @Data
    public static class OrderItemRequest {
        private Long bookId;
        private Integer quantity;
        private Double price;
    }
}
