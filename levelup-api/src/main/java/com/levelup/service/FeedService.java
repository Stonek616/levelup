package com.levelup.service;

import com.levelup.dto.response.FeedEventResponse;
import com.levelup.dto.response.TrendingGameResponse;
import com.levelup.model.FeedEvent;
import com.levelup.model.Game;
import com.levelup.model.Genre;
import com.levelup.model.enums.FeedEventType;
import com.levelup.repository.FeedEventRepository;
import com.levelup.repository.FriendshipRepository;
import com.levelup.repository.GameRepository;
import com.levelup.repository.LibraryEntryRepository;
import com.levelup.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedService {

    private final FeedEventRepository feedEventRepository;
    private final FriendshipRepository friendshipRepository;
    private final GameRepository gameRepository;
    private final LibraryEntryRepository libraryEntryRepository;
    private final UserRepository userRepository;

    public Page<FeedEventResponse> getFriendsFeed(UUID userId, Pageable pageable) {
        List<UUID> friendIds = friendshipRepository.findFriendIdsByUserId(userId);
        if (friendIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return feedEventRepository.findFriendsFeed(friendIds, pageable)
                .map(FeedEventResponse::from);
    }

    public Page<TrendingGameResponse> getTrending(Pageable pageable) {
        Instant cutoff = Instant.now().minus(7, ChronoUnit.DAYS);

        // Strip client-supplied sort — the JPQL query orders by activity count internally
        Pageable unsorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Page<Object[]> trendingPage = feedEventRepository.findTrendingWithCounts(cutoff, unsorted);

        if (trendingPage.isEmpty()) {
            return Page.empty(pageable);
        }

        // Extract ordered game IDs and their activity counts
        List<UUID> gameIds = new ArrayList<>();
        Map<UUID, Long> activityByGame = new java.util.LinkedHashMap<>();
        for (Object[] row : trendingPage.getContent()) {
            UUID gameId = (UUID) row[0];
            Long count = (Long) row[1];
            gameIds.add(gameId);
            activityByGame.put(gameId, count);
        }

        // Batch-load games with genres (single JOIN FETCH — no N+1)
        Map<UUID, Game> gamesById = gameRepository.findByIdInWithGenres(gameIds)
                .stream()
                .collect(Collectors.toMap(Game::getId, g -> g));

        // Batch-load community rating and rating count per game
        Map<UUID, double[]> ratingStats = libraryEntryRepository.findRatingStatsByGameIds(gameIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> new double[]{
                                row[1] != null ? ((Number) row[1]).doubleValue() : 0.0,
                                ((Number) row[2]).doubleValue()
                        }
                ));

        // Preserve the activity-count ordering from the trending query
        List<TrendingGameResponse> results = gameIds.stream()
                .filter(gamesById::containsKey)
                .map(id -> {
                    Game game = gamesById.get(id);
                    double[] stats = ratingStats.getOrDefault(id, new double[]{0.0, 0.0});
                    Double rating = stats[0] > 0 ? Math.round(stats[0] * 10.0) / 10.0 : null;
                    return TrendingGameResponse.builder()
                            .id(game.getId())
                            .slug(game.getSlug())
                            .title(game.getTitle())
                            .coverImageId(game.getCoverImageId())
                            .genres(game.getGenres().stream()
                                    .map(Genre::getName)
                                    .sorted()
                                    .toList())
                            .communityRating(rating)
                            .totalRatings((long) stats[1])
                            .recentActivity(activityByGame.get(id))
                            .build();
                })
                .toList();

        return new PageImpl<>(results, pageable, trendingPage.getTotalElements());
    }

    public Page<FeedEventResponse> getUserActivity(String username, Pageable pageable) {
        return feedEventRepository.findByUserUsername(username, pageable)
                .map(FeedEventResponse::from);
    }

    // Called by LibraryService when library entries are created or updated
    @Transactional
    public void emitFeedEvent(UUID userId, UUID gameId, FeedEventType type, String metadata) {
        if (type == FeedEventType.RATING_ADDED) {
            Instant window = Instant.now().minus(24, ChronoUnit.HOURS);
            feedEventRepository
                    .findByUserIdAndGameIdAndEventTypeAndCreatedAtAfter(userId, gameId, type, window)
                    .ifPresentOrElse(
                            existing -> {
                                existing.setMetadata(metadata);
                                feedEventRepository.save(existing);
                            },
                            () -> saveFeedEvent(userId, gameId, type, metadata)
                    );
            return;
        }
        saveFeedEvent(userId, gameId, type, metadata);
    }

    private void saveFeedEvent(UUID userId, UUID gameId, FeedEventType type, String metadata) {
        FeedEvent event = new FeedEvent();
        event.setUser(userRepository.getReferenceById(userId));
        event.setGame(gameRepository.getReferenceById(gameId));
        event.setEventType(type);
        event.setMetadata(metadata);
        feedEventRepository.save(event);
    }
}
