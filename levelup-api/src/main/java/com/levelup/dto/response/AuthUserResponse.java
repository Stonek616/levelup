package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.util.UUID;
import com.levelup.model.User;

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

    public static AuthUserResponse from(User user) {
        return AuthUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .onboardingCompleted(user.isOnboardingCompleted())
                .build();
    }
}
