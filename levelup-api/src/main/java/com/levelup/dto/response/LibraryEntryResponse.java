package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.levelup.model.LibraryEntry;
import com.levelup.model.enums.LibraryStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibraryEntryResponse {
    private UUID id;
    private GameSummaryResponse game;
    private LibraryStatus status;
    @JsonProperty("isOwned")
    private boolean isOwned;
    private List<String> platforms;
    private Integer rating;
    private Instant createdAt;
    private Instant updatedAt;

   public static LibraryEntryResponse from(LibraryEntry entry) {
        return LibraryEntryResponse.builder()
            .id(entry.getId())
            .game(GameSummaryResponse.from(entry.getGame()))
            .status(entry.getStatus())
            .isOwned(entry.isOwned())
            .platforms(entry.getPlatforms() != null ? List.of(entry.getPlatforms()) : List.of())
            .rating(entry.getRating())
            .createdAt(entry.getCreatedAt())
            .updatedAt(entry.getUpdatedAt())
            .build();
    }

}
