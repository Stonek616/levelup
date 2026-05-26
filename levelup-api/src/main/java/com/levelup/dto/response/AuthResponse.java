package com.levelup.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
  private String accessToken;
  @JsonIgnore private String refreshToken;
  private AuthUserResponse user;

  public static AuthResponse from(String accessToken, String refreshToken, AuthUserResponse user) {
    return AuthResponse.builder()
        .accessToken(accessToken)
        .refreshToken(refreshToken)
        .user(user)
        .build();
  }
}
