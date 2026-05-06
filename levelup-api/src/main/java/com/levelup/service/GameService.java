package com.levelup.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.levelup.dto.response.GameDetailResponse;
import com.levelup.dto.response.GameSummaryResponse;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.Game;
import com.levelup.repository.GameRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;

    @Transactional(readOnly = true)
    public List<GameSummaryResponse> searchGames(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<Game> games = gameRepository.findByTitleContainingIgnoreCase(query, pageable);
        return games.stream()
                .map(GameSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public GameDetailResponse getGame(UUID id) {
        Game game = gameRepository.findByIdWithGenresAndThemes(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + id));
        return GameDetailResponse.from(game);
    }
}
