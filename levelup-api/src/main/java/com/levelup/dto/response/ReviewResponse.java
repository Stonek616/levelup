package com.levelup.dto.response;

import com.levelup.model.Review;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {
  private UUID id;
  private UserSummaryResponse author;
  private GameSummaryResponse game;
  private String body;
  private Integer rating;
  private int likeCount;
  private long commentCount;
  private boolean likedByMe;
  private boolean isFriendReview;
  private Instant createdAt;
  private Instant updatedAt;

  public static ReviewResponse from(
      Review review, Integer rating, long commentCount, boolean likedByMe) {
    return ReviewResponse.builder()
        .id(review.getId())
        .author(UserSummaryResponse.from(review.getUser()))
        .game(GameSummaryResponse.from(review.getGame()))
        .body(review.getBody())
        .rating(rating)
        .likeCount(review.getLikeCount())
        .commentCount(commentCount)
        .likedByMe(likedByMe)
        .isFriendReview(false)
        .createdAt(review.getCreatedAt())
        .updatedAt(review.getUpdatedAt())
        .build();
  }
}
