package com.levelup.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.levelup.model.Game;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GameSummaryResponse {
    private UUID id;
    private Integer igdbId;
    private String slug;
    private String title;
    private String coverImageId;
    private Integer releaseYear;
    private String[] platforms;

    public static GameSummaryResponse from(Game game) {
        return GameSummaryResponse.builder()
                .id(game.getId())
                .igdbId(game.getIgdbId())
                .slug(game.getSlug())
                .title(game.getTitle())
                .coverImageId(game.getCoverImageId())
                .releaseYear(game.getReleaseYear())
                .platforms(game.getPlatforms())
                .build();
    }
}
