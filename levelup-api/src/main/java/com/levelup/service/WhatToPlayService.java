package com.levelup.service;

import com.levelup.dto.request.WhatToPlayRequest;
import com.levelup.dto.response.GameSuggestion;
import com.levelup.dto.response.GameSuggestionGame;
import com.levelup.dto.response.WhatToPlayResponse;
import com.levelup.model.Game;
import com.levelup.model.Genre;
import com.levelup.model.LibraryEntry;
import com.levelup.model.enums.Mood;
import com.levelup.model.enums.TimeAvailable;
import com.levelup.model.enums.WhatToPlayPlatform;
import com.levelup.repository.GameRepository;
import com.levelup.repository.LibraryEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WhatToPlayService {

    private static final Map<Mood, List<String>> MOOD_GENRES = new EnumMap<>(Mood.class);
    private static final List<String> SHORT_GENRES =
            List.of("Puzzle", "Sports", "Racing", "Fighting", "Arcade", "Casual");
    private static final List<String> LONG_GENRES =
            List.of("Role-playing (RPG)", "Strategy", "Real Time Strategy (RTS)",
                    "Simulation", "Turn-based strategy (TBS)");

    static {
        MOOD_GENRES.put(Mood.CHILL, List.of("Puzzle", "Simulation", "Adventure", "Casual", "Indie", "Strategy"));
        MOOD_GENRES.put(Mood.STORY, List.of("Adventure", "Role-playing (RPG)", "Visual Novel", "Point-and-click"));
        MOOD_GENRES.put(Mood.CHALLENGE, List.of("Platformer", "Shooter", "Fighting", "Racing", "Hack and slash/Beat 'em up"));
        MOOD_GENRES.put(Mood.SOCIAL, List.of());
        MOOD_GENRES.put(Mood.ANYTHING, List.of());
    }

    private final LibraryEntryRepository libraryEntryRepository;
    private final GameRepository gameRepository;

    public WhatToPlayResponse getSuggestions(UUID userId, WhatToPlayRequest request) {
        boolean needsMultiplayer = request.isMultiplayer() || request.getMood() == Mood.SOCIAL;

        List<LibraryEntry> allEntries = libraryEntryRepository.findAllByUserIdWithGameAndGenres(userId);

        List<ScoredEntry> candidates = new ArrayList<>();
        for (LibraryEntry entry : allEntries) {
            Game game = entry.getGame();
            String source = determineSource(entry);

            if ("ALREADY_PLAYED".equals(source) && !request.isIncludeAlreadyPlayed()) continue;
            if (request.getPlatform() != WhatToPlayPlatform.ANY && !matchesPlatform(game, request.getPlatform())) continue;
            if (!matchesMood(game, request.getMood())) continue;
            if (needsMultiplayer && !hasMultiplayer(game)) continue;

            candidates.add(new ScoredEntry(entry, source, score(entry, request, source)));
        }

        candidates.sort(Comparator.comparingInt(ScoredEntry::score).reversed());

        List<GameSuggestion> suggestions = new ArrayList<>();
        int rank = 1;
        for (ScoredEntry se : candidates) {
            if (suggestions.size() >= 5) break;
            String reason = buildReason(se.source(), request, needsMultiplayer);
            suggestions.add(new GameSuggestion(mapGame(se.entry().getGame()), se.source(), reason, rank++));
        }

        if (request.isIncludeNewSuggestions() && suggestions.size() < 5) {
            suggestions.addAll(getNewSuggestions(userId, request, needsMultiplayer, suggestions.size(), rank));
        }

        return new WhatToPlayResponse(suggestions);
    }

    private List<GameSuggestion> getNewSuggestions(UUID userId, WhatToPlayRequest request,
                                                    boolean needsMultiplayer, int existing, int startRank) {
        List<Object[]> genreRows = libraryEntryRepository.findGenreCountsByUserId(userId);
        if (genreRows.isEmpty()) return List.of();

        List<String> topGenres = genreRows.stream().limit(5).map(r -> (String) r[0]).toList();
        List<UUID> ids = gameRepository.findForYouGameIds(userId, topGenres, PageRequest.of(0, 20)).getContent();
        if (ids.isEmpty()) return List.of();

        List<Game> newGames = gameRepository.findByIdInWithGenres(ids);

        int rank = startRank;
        List<GameSuggestion> result = new ArrayList<>();
        for (Game game : newGames) {
            if (result.size() >= 5 - existing) break;
            if (request.getPlatform() != WhatToPlayPlatform.ANY && !matchesPlatform(game, request.getPlatform())) continue;
            if (!matchesMood(game, request.getMood())) continue;
            if (needsMultiplayer && !hasMultiplayer(game)) continue;

            String reason = "Based on your taste — matches genres you love";
            result.add(new GameSuggestion(mapGame(game), "NEW_SUGGESTION", reason, rank++));
        }
        return result;
    }

    private boolean matchesPlatform(Game game, WhatToPlayPlatform platform) {
        if (game.getPlatforms() == null) return false;
        String keyword = switch (platform) {
            case PC -> "Windows";
            case PLAYSTATION -> "PlayStation";
            case XBOX -> "Xbox";
            case SWITCH -> "Nintendo Switch";
            case ANY -> null;
        };
        return Arrays.stream(game.getPlatforms()).anyMatch(p -> p.contains(keyword));
    }

    private boolean hasMultiplayer(Game game) {
        if (game.getGameModes() == null) return false;
        return Arrays.stream(game.getGameModes()).anyMatch(m ->
                m.equalsIgnoreCase("Multiplayer") ||
                m.equalsIgnoreCase("Co-operative") ||
                m.equalsIgnoreCase("Split screen"));
    }

    private boolean matchesMood(Game game, Mood mood) {
        if (mood == Mood.ANYTHING || mood == Mood.SOCIAL) return true;
        List<String> moodGenres = MOOD_GENRES.get(mood);
        if (moodGenres.isEmpty()) return true;
        Set<String> gameGenreNames = game.getGenres().stream().map(Genre::getName).collect(Collectors.toSet());
        return moodGenres.stream().anyMatch(gameGenreNames::contains);
    }

    private String determineSource(LibraryEntry entry) {
        return switch (entry.getStatus()) {
            case PLAYED, FINISHED, COMPLETED -> "ALREADY_PLAYED";
            case BACKLOG, WISHLIST -> "BACKLOG";
            default -> entry.isOwned() ? "OWNED" : "BACKLOG";
        };
    }

    private int score(LibraryEntry entry, WhatToPlayRequest request, String source) {
        int s = switch (source) {
            case "BACKLOG" -> 3;
            case "OWNED" -> 2;
            case "ALREADY_PLAYED" -> 1;
            default -> 0;
        };

        Set<String> gameGenreNames = entry.getGame().getGenres().stream()
                .map(Genre::getName).collect(Collectors.toSet());

        if (request.getMood() != Mood.ANYTHING && request.getMood() != Mood.SOCIAL) {
            List<String> moodGenres = MOOD_GENRES.get(request.getMood());
            s += (int) Math.min(3, moodGenres.stream().filter(gameGenreNames::contains).count());
        }

        if (request.getTimeAvailable() == TimeAvailable.SHORT) {
            if (SHORT_GENRES.stream().anyMatch(gameGenreNames::contains)) s += 2;
        } else if (request.getTimeAvailable() == TimeAvailable.ALL_DAY) {
            if (LONG_GENRES.stream().anyMatch(gameGenreNames::contains)) s += 2;
        }

        return s;
    }

    private String buildReason(String source, WhatToPlayRequest request, boolean needsMultiplayer) {
        String sourceDesc = switch (source) {
            case "BACKLOG" -> "In your backlog";
            case "OWNED" -> "Owned but unplayed";
            case "ALREADY_PLAYED" -> "Previously played";
            default -> "In your library";
        };
        String moodDesc = switch (request.getMood()) {
            case CHILL -> "great for a relaxed session";
            case STORY -> "has an engaging narrative";
            case CHALLENGE -> "will test your skills";
            case SOCIAL -> "supports multiplayer";
            case ANYTHING -> "matches your criteria";
        };
        String timeDesc = switch (request.getTimeAvailable()) {
            case SHORT -> "quick to pick up";
            case FEW_HOURS -> "good for a few hours";
            case ALL_DAY -> "perfect for a long session";
        };
        return sourceDesc + " — " + moodDesc + " · " + timeDesc;
    }

    private GameSuggestionGame mapGame(Game game) {
        String coverUrl = game.getCoverImageId() != null
                ? "https://images.igdb.com/igdb/image/upload/t_cover_big/" + game.getCoverImageId() + ".jpg"
                : null;
        List<String> genres = game.getGenres().stream().map(Genre::getName).toList();
        List<String> gameModes = game.getGameModes() != null ? Arrays.asList(game.getGameModes()) : List.of();
        return new GameSuggestionGame(game.getId().toString(), game.getTitle(), coverUrl, genres, gameModes);
    }

    private record ScoredEntry(LibraryEntry entry, String source, int score) {}
}
