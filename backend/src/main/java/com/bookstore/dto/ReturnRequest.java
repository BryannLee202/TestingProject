package com.bookstore.dto;

import lombok.Data;

@Data
public class ReturnRequest {
    private String reason;
    private String phone;
    private String bank;
    private String details;
}
