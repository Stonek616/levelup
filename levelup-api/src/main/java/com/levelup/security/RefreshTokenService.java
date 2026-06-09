package com.levelup.security;

import com.levelup.exception.InvalidTokenException;
import com.levelup.model.RefreshToken;
import com.levelup.model.User;
import com.levelup.repository.RefreshTokenRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

  @Transactional
  public RefreshToken validateAndRotate(String tokenString) {
    RefreshToken refreshToken =
        refreshTokenRepository
            .findByToken(tokenString)
            .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

    if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
      throw new InvalidTokenException("Refresh token is expired or revoked");
    }

    if (refreshToken.isRevoked()) {
      refreshTokenRepository.delete(refreshToken);
      throw new InvalidTokenException("Refresh token has been revoked");
    }

    // Load the user while the entity is still managed, before deleting it
    User user = refreshToken.getUser();

    // Revoke the old token
    refreshTokenRepository.delete(refreshToken);

    // Create and return a new token
    return createRefreshToken(user);
  }

  public void revokeAllUserTokens(User user) {
    refreshTokenRepository.deleteByUser(user);
  }

  @Transactional(readOnly = true)
  public User getUserFromToken(String tokenString) {
    return refreshTokenRepository
        .findByToken(tokenString)
        .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"))
        .getUser();
  }
}
