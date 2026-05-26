package com.levelup.dto.response;

import com.levelup.model.Collection;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionSummaryResponse {

  private UUID id;
  private String name;
  private String description;
  private String visibility;
  private int gameCount;
  private List<String> previewCoverIds;
  private Instant createdAt;

  public static CollectionSummaryResponse from(
      Collection collection, int gameCount, List<String> previewCoverIds) {
    return CollectionSummaryResponse.builder()
        .id(collection.getId())
        .name(collection.getName())
        .description(collection.getDescription())
        .visibility(collection.getVisibility().name())
        .gameCount(gameCount)
        .previewCoverIds(previewCoverIds)
        .createdAt(collection.getCreatedAt())
        .build();
  }
}
