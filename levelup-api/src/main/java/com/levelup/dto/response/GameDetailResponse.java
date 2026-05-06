package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.util.List;
import com.levelup.model.Game;
import com.levelup.model.Genre;
import com.levelup.model.Theme;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GameDetailResponse {
    private UUID id;
    private Integer igdbId;
    private String title;
    private String coverImageId;
    private Integer releaseYear;
    private String summary;
    private String storyline;
    private String [] platforms;
    private String [] playerPerspectives;
    private String [] gameModes;
    private String [] developers;
    private List<String> genres;
    private List<String> themes;

        public static GameDetailResponse from (Game game){
            return GameDetailResponse.builder()
                    .id(game.getId())
                    .igdbId(game.getIgdbId())
                    .title(game.getTitle())
                    .coverImageId(game.getCoverImageId())
                    .releaseYear(game.getReleaseYear())
                    .summary(game.getSummary())
                    .storyline(game.getStoryline())
                    .platforms(game.getPlatforms())
                    .playerPerspectives(game.getPlayerPerspectives())
                    .gameModes(game.getGameModes())
                    .developers(game.getDevelopers())
                    .genres(game.getGenres().stream().map(Genre::getName).toList())
                    .themes(game.getThemes().stream().map(Theme::getName).toList())
                     .build();
        }

}
