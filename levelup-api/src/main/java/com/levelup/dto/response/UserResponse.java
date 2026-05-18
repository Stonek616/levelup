package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;
import com.levelup.model.User;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private String bio;
    private String avatarUrl;
    private boolean onboardingCompleted;
    private Instant createdAt;
    private long libraryCount;
    private long completedCount;
    private long reviewCount;
    private Boolean isFriend;
    private String friendRequestStatus;

    public static UserResponse from(User user, long libraryCount, long completedCount, long reviewCount) {
        return from(user, libraryCount, completedCount, reviewCount, null, null);
    }

    public static UserResponse from(User user, long libraryCount, long completedCount, long reviewCount,
                                    Boolean isFriend, String friendRequestStatus) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .onboardingCompleted(user.isOnboardingCompleted())
                .createdAt(user.getCreatedAt())
                .libraryCount(libraryCount)
                .completedCount(completedCount)
                .reviewCount(reviewCount)
                .isFriend(isFriend)
                .friendRequestStatus(friendRequestStatus)
                .build();
    }
}
