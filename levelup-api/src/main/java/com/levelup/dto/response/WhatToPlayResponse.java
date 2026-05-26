package com.levelup.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WhatToPlayResponse {
  private List<GameSuggestion> suggestions;
}
