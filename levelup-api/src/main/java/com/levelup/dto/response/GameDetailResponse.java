package com.levelup.dto.response;

import com.levelup.model.Game;
import com.levelup.model.Genre;
import com.levelup.model.Theme;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GameDetailResponse {
  private UUID id;
  private Integer igdbId;
  private String slug;
  private String title;
  private String coverImageId;
  private LocalDate firstReleaseDate;
  private Integer releaseYear;
  private String summary;
  private String storyline;
  private String[] platforms;
  private String[] playerPerspectives;
  private String[] gameModes;
  private String[] developers;
  private List<String> genres;
  private List<String> themes;

  public static GameDetailResponse from(Game game) {
    return GameDetailResponse.builder()
        .id(game.getId())
        .igdbId(game.getIgdbId())
        .slug(game.getSlug())
        .title(game.getTitle())
        .coverImageId(game.getCoverImageId())
        .firstReleaseDate(game.getFirstReleaseDate())
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
