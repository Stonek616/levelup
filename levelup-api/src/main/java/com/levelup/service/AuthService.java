package com.levelup.service;

import org.springframework.stereotype.Service;

import com.levelup.repository.UserRepository;
import com.levelup.security.JwtUtil;
import com.levelup.security.RefreshTokenService;
import com.levelup.dto.request.RegisterRequest;
import com.levelup.dto.request.LoginRequest;
import com.levelup.dto.response.AuthResponse;
import com.levelup.dto.response.AuthUserResponse;
import com.levelup.exception.ConflictException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.User;
import com.levelup.model.RefreshToken;
import com.levelup.model.PasswordResetToken;
import com.levelup.repository.PasswordResetTokenRepository;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already taken");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();
        return AuthResponse.from(accessToken, refreshToken, AuthUserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        refreshTokenService.revokeAllUserTokens(user);
        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();
        return AuthResponse.from(accessToken, refreshToken, AuthUserResponse.from(user));
    }

    public void logout(String refreshToken) {
        refreshTokenService.revokeAllUserTokens(
                refreshTokenService.getUserFromToken(refreshToken));
    }

    public AuthResponse refresh(String refreshToken) {
        RefreshToken newToken = refreshTokenService.validateAndRotate(refreshToken);
        User user = newToken.getUser();
        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        return AuthResponse.from(accessToken, newToken.getToken(), AuthUserResponse.from(user));
    }

    public void forgotPassword(String email){
        userRepository.findByEmail(email)
                .ifPresent(user ->{
                    passwordResetTokenRepository.deleteByUser(user);
                    String resetToken = UUID.randomUUID().toString();
                    PasswordResetToken passwordResetToken = new PasswordResetToken();
                    passwordResetToken.setUser(user);
                    passwordResetToken.setToken(resetToken);
                    passwordResetToken.setExpiresAt(Instant.now().plusSeconds(900)); // 15 minutes expiry
                    passwordResetTokenRepository.save(passwordResetToken);
                    emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
                });
        }
        

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired token"));
        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ConflictException("Token has expired");
        }
        User user = resetToken.getUser();
        refreshTokenService.revokeAllUserTokens(user);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
    }

}
