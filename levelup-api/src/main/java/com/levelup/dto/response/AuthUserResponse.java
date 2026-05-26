package com.levelup.dto.response;

import com.levelup.model.User;
import com.levelup.model.enums.UserRole;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserResponse {
  private UUID id;
  private String username;
  private String email;
  private String avatarUrl;
  private boolean onboardingCompleted;
  private UserRole role;

  public static AuthUserResponse from(User user) {
    return AuthUserResponse.builder()
        .id(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .avatarUrl(user.getAvatarUrl())
        .onboardingCompleted(user.isOnboardingCompleted())
        .role(user.getRole())
        .build();
  }
}
