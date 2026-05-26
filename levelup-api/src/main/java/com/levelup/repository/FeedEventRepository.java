package com.levelup.repository;

import com.levelup.model.FeedEvent;
import com.levelup.model.enums.FeedEventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeedEventRepository extends JpaRepository<FeedEvent, UUID> {

    // Used by FeedService to build the friends activity feed
    @Query(value = """
            SELECT fe FROM FeedEvent fe
            JOIN FETCH fe.user
            JOIN FETCH fe.game
            WHERE fe.user.id IN :userIds
            ORDER BY fe.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(fe) FROM FeedEvent fe
            WHERE fe.user.id IN :userIds
            """)
    Page<FeedEvent> findFriendsFeed(@Param("userIds") Collection<UUID> userIds, Pageable pageable);

    // Used by FeedService for trending — returns [gameId, activityCount] ordered by count desc
    @Query(value = """
            SELECT fe.game.id, COUNT(fe) AS activityCount
            FROM FeedEvent fe
            WHERE fe.createdAt >= :cutoff
            GROUP BY fe.game.id
            ORDER BY activityCount DESC
            """,
            countQuery = """
            SELECT COUNT(DISTINCT fe.game.id) FROM FeedEvent fe
            WHERE fe.createdAt >= :cutoff
            """)
    Page<Object[]> findTrendingWithCounts(@Param("cutoff") Instant cutoff, Pageable pageable);

    // Used by FeedService to deduplicate RATING_ADDED events within a 24-hour window
    Optional<FeedEvent> findByUserIdAndGameIdAndEventTypeAndCreatedAtAfter(
            UUID userId, UUID gameId, FeedEventType eventType, Instant after);

    // New & Notable — recent releases ordered by total community activity
    @Query(value = """
            SELECT fe.game.id, COUNT(fe) AS activityCount
            FROM FeedEvent fe
            WHERE fe.game.releaseYear >= :sinceYear
            GROUP BY fe.game.id
            ORDER BY activityCount DESC
            """,
            countQuery = """
            SELECT COUNT(DISTINCT fe.game.id) FROM FeedEvent fe
            WHERE fe.game.releaseYear >= :sinceYear
            """)
    Page<Object[]> findNewAndNotableWithCounts(@Param("sinceYear") int sinceYear, Pageable pageable);

    // Used by FeedEventCleanupScheduler
    void deleteByCreatedAtBefore(Instant cutoff);

    // User profile activity feed
    @Query(value = """
            SELECT fe FROM FeedEvent fe
            JOIN FETCH fe.user
            JOIN FETCH fe.game
            WHERE fe.user.username = :username
            ORDER BY fe.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(fe) FROM FeedEvent fe
            JOIN fe.user u
            WHERE u.username = :username
            """)
    Page<FeedEvent> findByUserUsername(@Param("username") String username, Pageable pageable);
}
