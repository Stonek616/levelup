package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GameSuggestion {
    private GameSuggestionGame game;
    private String source;
    private String reason;
    private int rank;
}
