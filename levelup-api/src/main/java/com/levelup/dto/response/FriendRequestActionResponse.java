package com.levelup.dto.response;

import com.levelup.model.FriendRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestActionResponse {

    private UUID id;
    private String status;
    private Instant updatedAt;

    public static FriendRequestActionResponse from(FriendRequest request) {
        return FriendRequestActionResponse.builder()
                .id(request.getId())
                .status(request.getStatus().name())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
