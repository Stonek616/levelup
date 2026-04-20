package com.levelup.security;

import org.springframework.stereotype.Service;

import com.levelup.model.RefreshToken;
import com.levelup.model.User;
import com.levelup.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

import java.time.Instant;
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    public RefreshToken createRefreshToken(User user) {

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(java.util.UUID.randomUUID().toString());
        refreshToken.setExpiresAt(Instant.now().plusMillis(jwtUtil.getRefreshTokenExpirationMs()));
        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken validateAndRotate(String tokenString) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Refresh token is expired or revoked");
        }

        // Revoke the old token
        refreshTokenRepository.delete(refreshToken);

        // Create and return a new token
        return createRefreshToken(refreshToken.getUser());
    }

    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
    public User getUserFromToken(String tokenString) {
        return refreshTokenRepository.findByToken(tokenString) 
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"))
                .getUser();
    }
}
