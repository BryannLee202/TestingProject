package com.bookstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SocialLoginRequest {
    private String provider; // "GOOGLE", "APPLE"
    private String token; // The JWT token from Google/Apple, or we can just mock it with providerId and email for now
    private String email;
    private String name;
    private String providerId;
}
