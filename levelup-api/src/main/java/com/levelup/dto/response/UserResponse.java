package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;
import com.levelup.model.User;
import com.levelup.model.enums.UserRole;
import com.levelup.model.enums.VisibilityType;

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
    private UserRole role;
    private Instant createdAt;
    private long libraryCount;
    private long completedCount;
    private long reviewCount;
    private long friendCount;
    private Boolean isFriend;
    private String friendRequestStatus;
    private VisibilityType libraryVisibility;
    private VisibilityType wishlistVisibility;
    private VisibilityType reviewsVisibility;

    public static UserResponse from(User user, long libraryCount, long completedCount, long reviewCount,
                                    long friendCount) {
        return from(user, libraryCount, completedCount, reviewCount, friendCount, null, null);
    }

    public static UserResponse from(User user, long libraryCount, long completedCount, long reviewCount,
                                    long friendCount, Boolean isFriend, String friendRequestStatus) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .onboardingCompleted(user.isOnboardingCompleted())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .libraryCount(libraryCount)
                .completedCount(completedCount)
                .reviewCount(reviewCount)
                .friendCount(friendCount)
                .isFriend(isFriend)
                .friendRequestStatus(friendRequestStatus)
                .libraryVisibility(user.getLibraryVisibility())
                .wishlistVisibility(user.getWishlistVisibility())
                .reviewsVisibility(user.getReviewsVisibility())
                .build();
    }
}
