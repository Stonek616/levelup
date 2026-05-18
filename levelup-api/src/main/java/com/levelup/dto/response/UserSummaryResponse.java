package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.levelup.model.User;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserSummaryResponse {
    private UUID id;
    private String username;
    private String avatarUrl;
    private Boolean isFriend;
    private String friendRequestStatus;

    public static UserSummaryResponse from(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .isFriend(null)
                .friendRequestStatus(null)
                .build();
    }

    public static UserSummaryResponse from(User user, boolean isFriend, String friendRequestStatus) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .isFriend(isFriend)
                .friendRequestStatus(friendRequestStatus)
                .build();
    }
}
