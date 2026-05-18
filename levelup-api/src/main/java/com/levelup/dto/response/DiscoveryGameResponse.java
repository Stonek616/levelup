package com.levelup.dto.response;

import com.levelup.model.Game;
import com.levelup.model.Genre;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscoveryGameResponse {
    private UUID id;
    private String title;
    private String coverImageId;
    private Integer releaseYear;
    private List<String> genres;

    public static DiscoveryGameResponse from(Game game) {
        return DiscoveryGameResponse.builder()
                .id(game.getId())
                .title(game.getTitle())
                .coverImageId(game.getCoverImageId())
                .releaseYear(game.getReleaseYear())
                .genres(game.getGenres().stream()
                        .map(Genre::getName)
                        .sorted()
                        .toList())
                .build();
    }
}
