package com.levelup.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.levelup.dto.response.GameDetailResponse;
import com.levelup.dto.response.GameSummaryResponse;
import com.levelup.service.GameService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping("/search")
    public ResponseEntity<List<GameSummaryResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<GameSummaryResponse> results = gameService.searchGames(q, page, size);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDetailResponse> getGame(@PathVariable UUID id) {
        GameDetailResponse result = gameService.getGame(id);
        return ResponseEntity.ok(result);
    }
}
