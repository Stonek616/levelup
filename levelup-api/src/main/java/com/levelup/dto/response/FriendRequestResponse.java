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
public class FriendRequestResponse {

  private UUID id;
  private UserSummaryResponse requester;
  private Instant createdAt;

  public static FriendRequestResponse from(FriendRequest request) {
    return FriendRequestResponse.builder()
        .id(request.getId())
        .requester(UserSummaryResponse.from(request.getRequester()))
        .createdAt(request.getCreatedAt())
        .build();
  }
}
