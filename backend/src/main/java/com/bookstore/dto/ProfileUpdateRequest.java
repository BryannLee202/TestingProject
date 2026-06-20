package com.bookstore.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String gender;
    private String birthday;
}
