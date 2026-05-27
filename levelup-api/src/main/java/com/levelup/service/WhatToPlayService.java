package com.levelup.service;

import com.levelup.dto.request.WhatToPlayRequest;
import com.levelup.dto.response.GameSuggestion;
import com.levelup.dto.response.GameSuggestionGame;
import com.levelup.dto.response.WhatToPlayResponse;
import com.levelup.model.Game;
import com.levelup.model.Genre;
import com.levelup.model.LibraryEntry;
import com.levelup.model.enums.GamePlatform;
import com.levelup.model.enums.LibraryStatus;
import com.levelup.model.enums.OwnershipStatus;
import com.levelup.repository.GameRepository;
import com.levelup.repository.LibraryEntryRepository;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/*
 * Simplified What to Play service.
 *
 * Three moods, in spirit:
 *   - FAMILIAR    → pull from the user's owned/backlog library
 *   - NEW         → pull from outside the library (recommendation engine)
 *   - SURPRISE    → randomly pick a familiar game, biased toward backlog
 *
 * Filters always apply (platform, multiplayer). No fake "time available" filter
 * since we don't have time-to-complete data.
 */
@Service
@RequiredArgsConstructor
public class WhatToPlayService {

  private static final int RESULT_SIZE = 5;
  private static final int CANDIDATE_POOL_SIZE = 40;
  private static final int RATING_THRESHOLD_FOR_RECS = 6;

  private final LibraryEntryRepository libraryEntryRepository;
  private final GameRepository gameRepository;

  public WhatToPlayResponse getSuggestions(UUID userId, WhatToPlayRequest request) {
    List<GameSuggestion> suggestions =
        switch (request.getMood()) {
          case FAMILIAR -> getFamiliarSuggestions(userId, request);
          case NEW -> getNewSuggestions(userId, request);
          case SURPRISE -> getSurpriseSuggestions(userId, request);
        };
    return new WhatToPlayResponse(suggestions);
  }

  /*
   * Familiar: games already in the user's library that match their criteria.
   * Priority order: Backlog (unplayed but owned) > Owned > Already played.
   */
  private List<GameSuggestion> getFamiliarSuggestions(UUID userId, WhatToPlayRequest request) {
    List<LibraryEntry> entries = libraryEntryRepository.findAllByUserIdWithGameAndGenres(userId);

    List<ScoredEntry> candidates =
        entries.stream()
            .filter(e -> passesFilters(e.getGame(), request))
            .filter(e -> request.isIncludeAlreadyPlayed() || !isAlreadyPlayed(e))
            .map(e -> new ScoredEntry(e, sourceOf(e), scoreFamiliar(e)))
            .sorted(Comparator.comparingInt(ScoredEntry::score).reversed())
            .limit(RESULT_SIZE)
            .toList();

    AtomicRank rank = new AtomicRank();
    return candidates.stream()
        .map(
            se ->
                new GameSuggestion(
                    mapGame(se.entry().getGame()),
                    se.source(),
                    reasonForFamiliar(se.source()),
                    rank.next()))
        .toList();
  }

  /*
   * New: recommendation engine results, filtered to match the user's platform/multiplayer needs.
   * Pulls a larger candidate pool than needed, then filters down — since the engine doesn't know
   * about platform constraints, we filter post-recommendation rather than pre.
   */
  private List<GameSuggestion> getNewSuggestions(UUID userId, WhatToPlayRequest request) {
    boolean hasRatings = gameRepository.userHasRatedGames(userId, RATING_THRESHOLD_FOR_RECS);
    String platformName =
        request.getPlatform() == GamePlatform.ANY ? null : request.getPlatform().getDisplayName();

    List<UUID> candidateIds =
        (hasRatings
                ? gameRepository.findRecommendedGameIds(
                    userId,
                    RATING_THRESHOLD_FOR_RECS,
                    platformName,
                    PageRequest.of(0, CANDIDATE_POOL_SIZE))
                : gameRepository.findThemeBasedRecommendations(
                    userId, platformName, PageRequest.of(0, CANDIDATE_POOL_SIZE)))
            .getContent();

    if (candidateIds.isEmpty()) return List.of();

    List<Game> candidates = gameRepository.findByIdInWithGenres(candidateIds);
    Map<UUID, Game> byId = candidates.stream().collect(Collectors.toMap(Game::getId, g -> g));

    // Preserve recommendation order; filter down to RESULT_SIZE (multiplayer check only — platform
    // already applied in query)
    AtomicRank rank = new AtomicRank();
    return candidateIds.stream()
        .map(byId::get)
        .filter(Objects::nonNull)
        .filter(g -> !request.isMultiplayer() || hasMultiplayer(g))
        .limit(RESULT_SIZE)
        .map(
            g ->
                new GameSuggestion(
                    mapGame(g), "NEW_SUGGESTION", "Based on games you've loved", rank.next()))
        .toList();
  }

  /*
   * Surprise: a single random pick from the user's library, biased toward backlog.
   * Returns 1 game (not 5) since the whole point is "just pick something."
   */
  private List<GameSuggestion> getSurpriseSuggestions(UUID userId, WhatToPlayRequest request) {
    List<LibraryEntry> entries = libraryEntryRepository.findAllByUserIdWithGameAndGenres(userId);

    List<LibraryEntry> pool =
        entries.stream()
            .filter(e -> passesFilters(e.getGame(), request))
            .filter(e -> !isAlreadyPlayed(e))
            .toList();

    if (pool.isEmpty()) return List.of();

    // Weighted random: backlog gets weight 3, owned gets 2, anything else 1
    List<LibraryEntry> weighted = new ArrayList<>();
    for (LibraryEntry e : pool) {
      int weight =
          switch (sourceOf(e)) {
            case "BACKLOG" -> 3;
            case "OWNED" -> 2;
            default -> 1;
          };
      for (int i = 0; i < weight; i++) weighted.add(e);
    }

    LibraryEntry pick = weighted.get(ThreadLocalRandom.current().nextInt(weighted.size()));
    return List.of(
        new GameSuggestion(
            mapGame(pick.getGame()),
            sourceOf(pick),
            "A random pick from your library — give it a chance",
            1));
  }

  // ── Filter helpers ─────────────────────────────────────────────

  private boolean passesFilters(Game game, WhatToPlayRequest request) {
    if (request.getPlatform() != GamePlatform.ANY
        && !matchesPlatform(game, request.getPlatform())) {
      return false;
    }
    if (request.isMultiplayer() && !hasMultiplayer(game)) {
      return false;
    }
    return true;
  }

  private boolean matchesPlatform(Game game, GamePlatform platform) {
    if (game.getPlatforms() == null) return false;
    String name = platform.getDisplayName();
    return Arrays.asList(game.getPlatforms()).contains(name);
  }

  private boolean hasMultiplayer(Game game) {
    if (game.getGameModes() == null) return false;
    return Arrays.stream(game.getGameModes())
        .anyMatch(
            m ->
                m.equalsIgnoreCase("Multiplayer")
                    || m.equalsIgnoreCase("Co-operative")
                    || m.equalsIgnoreCase("Split screen"));
  }

  // ── Scoring helpers ────────────────────────────────────────────

  private int scoreFamiliar(LibraryEntry entry) {
    return switch (sourceOf(entry)) {
      case "BACKLOG" -> 3;
      case "OWNED" -> 2;
      case "ALREADY_PLAYED" -> 1;
      default -> 0;
    };
  }

  private String sourceOf(LibraryEntry entry) {
    if (isAlreadyPlayed(entry)) return "ALREADY_PLAYED";
    if (entry.getStatus() == LibraryStatus.BACKLOG) return "BACKLOG";
    if (entry.getOwnership() == OwnershipStatus.OWNED) return "OWNED";
    return "BACKLOG";
  }

  private boolean isAlreadyPlayed(LibraryEntry entry) {
    if (entry.getStatus() == null) return false;
    return switch (entry.getStatus()) {
      case PLAYED, FINISHED, COMPLETED -> true;
      default -> false;
    };
  }

  private String reasonForFamiliar(String source) {
    return switch (source) {
      case "BACKLOG" -> "From your backlog — time to start it";
      case "OWNED" -> "You own this but haven't started yet";
      case "ALREADY_PLAYED" -> "You've played this — worth revisiting";
      default -> "From your library";
    };
  }

  private GameSuggestionGame mapGame(Game game) {
    String coverUrl =
        game.getCoverImageId() != null
            ? "https://images.igdb.com/igdb/image/upload/t_cover_big/"
                + game.getCoverImageId()
                + ".jpg"
            : null;
    List<String> genres = game.getGenres().stream().map(Genre::getName).toList();
    List<String> gameModes =
        game.getGameModes() != null ? Arrays.asList(game.getGameModes()) : List.of();
    return new GameSuggestionGame(
        game.getId().toString(), game.getSlug(), game.getTitle(), coverUrl, genres, gameModes);
  }

  // Small helper to avoid using a mutable int in the lambda
  private static class AtomicRank {
    private int n = 1;

    int next() {
      return n++;
    }
  }

  private record ScoredEntry(LibraryEntry entry, String source, int score) {}
}
