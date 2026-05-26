package com.levelup.dto.response;

import com.levelup.model.FriendRequest;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
