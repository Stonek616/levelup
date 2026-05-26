package com.levelup.dto.response;

import com.levelup.model.ReviewComment;
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
public class CommentResponse {
  private UUID id;
  private UserSummaryResponse author;
  private String body;
  private int likeCount;
  private boolean likedByMe;
  private Instant createdAt;

  public static CommentResponse from(ReviewComment comment, boolean likedByMe) {
    return CommentResponse.builder()
        .id(comment.getId())
        .author(UserSummaryResponse.from(comment.getUser()))
        .body(comment.getBody())
        .likeCount(comment.getLikeCount())
        .likedByMe(likedByMe)
        .createdAt(comment.getCreatedAt())
        .build();
  }
}
