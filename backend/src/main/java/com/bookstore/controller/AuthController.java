package com.bookstore.controller;

import com.bookstore.dto.AuthRequest;
import com.bookstore.dto.AuthResponse;
import com.bookstore.dto.RegisterRequest;
import com.bookstore.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody com.bookstore.dto.OtpRequest request) {
        authService.sendOtp(request.getPhone(), request.getEmail());
        return ResponseEntity.ok().body(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/social-login")
    public ResponseEntity<AuthResponse> socialLogin(@RequestBody com.bookstore.dto.SocialLoginRequest request) {
        return ResponseEntity.ok(authService.socialLogin(request));
    }
}
