package com.levelup.service;

import com.levelup.dto.response.DiscoveryGameResponse;
import com.levelup.model.Game;
import com.levelup.repository.FeedEventRepository;
import com.levelup.repository.GameRepository;
import com.levelup.repository.LibraryEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiscoveryService {

    /*
     * Minimum rating threshold for a game to count as "liked" when sourcing recommendations.
     * Picked 7 as the cutoff because anything 6 and below typically reflects mixed feelings,
     * while 7+ usually means the user genuinely enjoyed the game.
     */
    private static final int LIKED_THRESHOLD = 7;

    /*
     * Lower threshold used for the "Similar" feed — gives the user broader recommendations
     * by sourcing from a wider pool of their library when they don't have many highly-rated games.
     */
    private static final int SIMILAR_THRESHOLD = 6;

    private final LibraryEntryRepository libraryEntryRepository;
    private final GameRepository gameRepository;
    private final FeedEventRepository feedEventRepository;

    /*
     * For You — personalised recommendations.
     * Strategy: use IGDB's similar_game_ids field, treating each of the user's
     * highly-rated games as a source for similar candidates. Games that appear
     * as "similar to" multiple liked games rank highest.
     *
     * Fallback: if the user has no rated games yet, recommend by theme overlap
     * with their library (regardless of rating).
     */
    public Page<DiscoveryGameResponse> getForYou(UUID userId, Pageable pageable) {
        Page<UUID> idPage;

        if (gameRepository.userHasRatedGames(userId, LIKED_THRESHOLD)) {
            idPage = gameRepository.findRecommendedGameIds(userId, LIKED_THRESHOLD, null, pageable);
        } else {
            // Cold-start path: theme overlap based on whatever's in their library
            idPage = gameRepository.findThemeBasedRecommendations(userId, null, pageable);
        }

        return buildPage(idPage, pageable);
    }

    /*
     * Similar — broader version of For You. Same underlying algorithm but uses
     * a more permissive rating threshold to include games the user merely liked.
     */
    public Page<DiscoveryGameResponse> getSimilar(UUID userId, Pageable pageable) {
        Page<UUID> idPage;

        if (gameRepository.userHasRatedGames(userId, SIMILAR_THRESHOLD)) {
            idPage = gameRepository.findRecommendedGameIds(userId, SIMILAR_THRESHOLD, null, pageable);
        } else {
            idPage = gameRepository.findThemeBasedRecommendations(userId, null, pageable);
        }

        return buildPage(idPage, pageable);
    }

    /*
     * New & Notable — kept from previous version. Surfaces games released recently
     * that have generated activity on the platform.
     */
    public Page<DiscoveryGameResponse> getNewAndNotable(Pageable pageable) {
        int sinceYear = LocalDate.now().getYear() - 2;
        Page<Object[]> countPage = feedEventRepository.findNewAndNotableWithCounts(sinceYear, pageable);

        if (countPage.isEmpty()) return Page.empty(pageable);

        List<UUID> gameIds = countPage.getContent().stream()
                .map(row -> (UUID) row[0])
                .toList();

        return buildResponsePage(gameIds, countPage.getTotalElements(), pageable);
    }

    private Page<DiscoveryGameResponse> buildPage(Page<UUID> idPage, Pageable pageable) {
        if (idPage.isEmpty()) return Page.empty(pageable);
        return buildResponsePage(idPage.getContent(), idPage.getTotalElements(), pageable);
    }

    private Page<DiscoveryGameResponse> buildResponsePage(List<UUID> ids, long total, Pageable pageable) {
        if (ids.isEmpty()) return Page.empty(pageable);

        Map<UUID, Game> gamesById = gameRepository.findByIdInWithGenres(ids).stream()
                .collect(Collectors.toMap(Game::getId, g -> g));

        // Preserve the ID ordering from the recommendation query — that's the ranking
        List<DiscoveryGameResponse> results = ids.stream()
                .filter(gamesById::containsKey)
                .map(id -> DiscoveryGameResponse.from(gamesById.get(id)))
                .toList();

        return new PageImpl<>(results, pageable, total);
    }
}