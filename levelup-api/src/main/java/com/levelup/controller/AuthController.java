package com.levelup.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.levelup.service.AuthService;
import com.levelup.dto.request.RegisterRequest;
import com.levelup.dto.request.ForgotPasswordRequest;
import com.levelup.dto.request.ResetPasswordRequest;
import com.levelup.dto.request.LoginRequest;
import com.levelup.dto.response.AuthResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CookieValue;
import jakarta.servlet.http.Cookie;
import org.springframework.http.HttpStatus;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody @Valid RegisterRequest request,
            HttpServletResponse response) {
        AuthResponse result = authService.register(request);
        Cookie cookie = new Cookie("refreshToken", result.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(14 * 24 * 60 * 60); // 14 days
        response.addCookie(cookie);

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody @Valid LoginRequest request,
            HttpServletResponse response) {
        AuthResponse result = authService.login(request);
        Cookie cookie = new Cookie("refreshToken", result.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(14 * 24 * 60 * 60); // 14 days
        response.addCookie(cookie);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue("refreshToken") String refreshToken,
            HttpServletResponse response) {
        authService.logout(refreshToken);
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0); // Expire immediately
        response.addCookie(cookie);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue("refreshToken") String refreshToken,
            HttpServletResponse response) {
        AuthResponse result = authService.refresh(refreshToken);
        Cookie cookie = new Cookie("refreshToken", result.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(14 * 24 * 60 * 60); // 14 days
        response.addCookie(cookie);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
