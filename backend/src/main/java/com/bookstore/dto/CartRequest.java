package com.bookstore.dto;

import lombok.Data;

@Data
public class CartRequest {
    private Long bookId;
    private Integer quantity;
}
