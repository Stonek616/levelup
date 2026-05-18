package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class WhatToPlayResponse {
    private List<GameSuggestion> suggestions;
}
