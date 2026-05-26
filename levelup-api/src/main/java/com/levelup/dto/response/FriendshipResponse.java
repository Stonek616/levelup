package com.levelup.dto.response;

import com.levelup.model.Friendship;
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
public class FriendshipResponse {

  private UUID id;
  private String username;
  private String avatarUrl;
  private String bio;
  private Instant friendSince;

  public static FriendshipResponse from(Friendship friendship) {
    return FriendshipResponse.builder()
        .id(friendship.getFriend().getId())
        .username(friendship.getFriend().getUsername())
        .avatarUrl(friendship.getFriend().getAvatarUrl())
        .bio(friendship.getFriend().getBio())
        .friendSince(friendship.getCreatedAt())
        .build();
  }
}
