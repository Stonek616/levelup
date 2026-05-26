package com.levelup.repository;

import com.levelup.model.LibraryEntry;
import com.levelup.model.enums.LibraryStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LibraryEntryRepository extends JpaRepository<LibraryEntry, UUID> {

  boolean existsByUserIdAndGameId(UUID userId, UUID gameId);

  long countByUserId(UUID userId);

  long countByUserIdAndStatus(UUID userId, LibraryStatus status);

  Optional<LibraryEntry> findByUserIdAndGameId(UUID userId, UUID gameId);

  @Query(
      value =
          """
            SELECT * FROM library_entries
            WHERE user_id = :userId
            AND (:status IS NULL OR status = :status)
            AND (:ownership IS NULL OR ownership = :ownership)
            AND (:platform IS NULL OR :platform = ANY(platforms))
            """,
      nativeQuery = true)
  Page<LibraryEntry> findWithFilters(
      @Param("userId") UUID userId,
      @Param("status") String status,
      @Param("ownership") String ownership,
      @Param("platform") String platform,
      Pageable pageable);

  @Query(
      """
            SELECT le FROM LibraryEntry le
            WHERE le.user.id = :userId
            AND le.ownership = com.levelup.model.enums.OwnershipStatus.OWNED
            AND le.game.id IN (
                SELECT le2.game.id FROM LibraryEntry le2
                WHERE le2.user.id = :friendId
                AND le2.ownership = com.levelup.model.enums.OwnershipStatus.OWNED
            )
            """)
  Page<LibraryEntry> findSharedOwnedGames(
      @Param("userId") UUID userId, @Param("friendId") UUID friendId, Pageable pageable);

  @Query(
      """
            SELECT g.name, COUNT(g) as cnt
            FROM LibraryEntry le
            JOIN le.game.genres g
            WHERE le.user.id = :userId
            AND (le.rating IS NOT NULL OR le.status IN ('FINISHED', 'COMPLETED', 'PLAYED', 'PLAYING'))
            GROUP BY g.name
            ORDER BY cnt DESC
            """)
  List<Object[]> findGenreCountsByUserId(@Param("userId") UUID userId);

  @Query(
      """
            SELECT t.name, COUNT(t) as cnt
            FROM LibraryEntry le
            JOIN le.game.themes t
            WHERE le.user.id = :userId
            AND (le.rating IS NOT NULL OR le.status IN ('FINISHED', 'COMPLETED', 'PLAYED', 'PLAYING'))
            GROUP BY t.name
            ORDER BY cnt DESC
            """)
  List<Object[]> findThemeCountsByUserId(@Param("userId") UUID userId);

  @Query(
      "SELECT AVG(le.rating) FROM LibraryEntry le WHERE le.user.id = :userId AND le.rating IS NOT NULL")
  Double findAverageRatingByUserId(@Param("userId") UUID userId);

  long countByUserIdAndRatingIsNotNull(UUID userId);

  @Query(
      """
            SELECT le.game.id, AVG(le.rating), COUNT(le)
            FROM LibraryEntry le
            WHERE le.game.id IN :gameIds AND le.rating IS NOT NULL
            GROUP BY le.game.id
            """)
  List<Object[]> findRatingStatsByGameIds(@Param("gameIds") List<UUID> gameIds);

  @Query(
      value =
          """
            SELECT p, COUNT(*) as cnt
            FROM library_entries, unnest(platforms) as p
            WHERE user_id = :userId
            GROUP BY p
            ORDER BY cnt DESC
            LIMIT 5
            """,
      nativeQuery = true)
  List<Object[]> findTopPlatformsByUserId(@Param("userId") UUID userId);

  @Query(
      """
            SELECT DISTINCT le FROM LibraryEntry le
            JOIN FETCH le.game g
            LEFT JOIN FETCH g.genres
            WHERE le.user.id = :userId
            """)
  List<LibraryEntry> findAllByUserIdWithGameAndGenres(@Param("userId") UUID userId);
}
