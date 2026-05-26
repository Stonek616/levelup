package com.levelup.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GameSuggestionGame {
  private String id;
  private String slug;
  private String title;
  private String coverUrl;
  private List<String> genres;
  private List<String> gameModes;
}
