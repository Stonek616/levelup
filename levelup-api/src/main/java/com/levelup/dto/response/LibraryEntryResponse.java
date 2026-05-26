package com.levelup.dto.response;

import com.levelup.model.LibraryEntry;
import com.levelup.model.enums.LibraryStatus;
import com.levelup.model.enums.OwnershipStatus;
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
public class LibraryEntryResponse {
  private UUID id;
  private GameSummaryResponse game;
  private LibraryStatus status;
  private OwnershipStatus ownership;
  private List<String> platforms;
  private Integer rating;
  private Instant createdAt;
  private Instant updatedAt;

  public static LibraryEntryResponse from(LibraryEntry entry) {
    return LibraryEntryResponse.builder()
        .id(entry.getId())
        .game(GameSummaryResponse.from(entry.getGame()))
        .status(entry.getStatus())
        .ownership(entry.getOwnership())
        .platforms(entry.getPlatforms() != null ? List.of(entry.getPlatforms()) : List.of())
        .rating(entry.getRating())
        .createdAt(entry.getCreatedAt())
        .updatedAt(entry.getUpdatedAt())
        .build();
  }
}
