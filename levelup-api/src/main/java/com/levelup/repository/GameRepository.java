package com.levelup.repository;

import com.levelup.model.Game;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GameRepository extends JpaRepository<Game, UUID> {
    Optional<Game> findByIgdbId(Integer igdbId);
    List<Game> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Query("SELECT g FROM Game g LEFT JOIN FETCH g.genres LEFT JOIN FETCH g.themes WHERE g.id = :id")
    Optional<Game> findByIdWithGenresAndThemes(@Param("id") UUID id);

    @Query("SELECT g FROM Game g LEFT JOIN FETCH g.genres LEFT JOIN FETCH g.themes WHERE g.slug = :slug")
    Optional<Game> findBySlugWithGenresAndThemes(@Param("slug") String slug);

    // Loads a batch of games with genres in one query — used by trending to avoid N+1
    @Query("SELECT g FROM Game g LEFT JOIN FETCH g.genres WHERE g.id IN :ids")
    List<Game> findByIdInWithGenres(@Param("ids") List<UUID> ids);

    /*
     * Recommendation engine — IGDB-similars-based.
     *
     * For each game the user has liked (rated >= :minRating), flatten its similar_game_ids array.
     * Count how often each candidate game appears across the user's liked library.
     * A game that's "similar to" multiple liked games scores higher than one that's only similar to one.
     *
     * Returns: game UUIDs ranked by overlap count, with average source rating as a tiebreaker.
     * Excludes games already in the user's library.
     */
    @Query(value = """
            WITH user_likes AS (
                SELECT g.igdb_id, le.rating
                FROM library_entries le
                JOIN games g ON g.id = le.game_id
                WHERE le.user_id = :userId
                  AND le.rating >= :minRating
            ),
            unnested_similars AS (
                SELECT UNNEST(g.similar_game_ids) AS similar_igdb_id,
                       ul.rating AS source_rating
                FROM games g
                JOIN user_likes ul ON g.igdb_id = ul.igdb_id
                WHERE g.similar_game_ids IS NOT NULL
            )
            SELECT g.id
            FROM unnested_similars uns
            JOIN games g ON g.igdb_id = uns.similar_igdb_id
            WHERE g.id NOT IN (
                SELECT le.game_id FROM library_entries le WHERE le.user_id = :userId
            )
            AND (:platformName IS NULL OR :platformName = ANY(g.platforms))
            GROUP BY g.id, g.release_year
            ORDER BY COUNT(*) DESC, AVG(uns.source_rating) DESC, g.release_year DESC NULLS LAST
            """,
            countQuery = """
            WITH user_likes AS (
                SELECT g.igdb_id
                FROM library_entries le
                JOIN games g ON g.id = le.game_id
                WHERE le.user_id = :userId
                  AND le.rating >= :minRating
            ),
            unnested_similars AS (
                SELECT DISTINCT UNNEST(g.similar_game_ids) AS similar_igdb_id
                FROM games g
                JOIN user_likes ul ON g.igdb_id = ul.igdb_id
                WHERE g.similar_game_ids IS NOT NULL
            )
            SELECT COUNT(DISTINCT g.id)
            FROM unnested_similars uns
            JOIN games g ON g.igdb_id = uns.similar_igdb_id
            WHERE g.id NOT IN (
                SELECT le.game_id FROM library_entries le WHERE le.user_id = :userId
            )
            AND (:platformName IS NULL OR :platformName = ANY(g.platforms))
            """,
            nativeQuery = true)
    Page<UUID> findRecommendedGameIds(
            @Param("userId") UUID userId,
            @Param("minRating") int minRating,
            @Param("platformName") String platformName,
            Pageable pageable);

    /*
     * Fallback recommendation — used when the user has no rated games yet.
     * Uses theme overlap from their library (any status, any rating) since we have no other signal.
     * Sorted by aggregate library popularity across all users.
     */
    @Query(value = """
            SELECT g.id
            FROM games g
            JOIN game_themes gt ON gt.game_id = g.id
            WHERE gt.theme_id IN (
                SELECT DISTINCT gt2.theme_id
                FROM library_entries le
                JOIN game_themes gt2 ON gt2.game_id = le.game_id
                WHERE le.user_id = :userId
            )
            AND g.id NOT IN (
                SELECT le.game_id FROM library_entries le WHERE le.user_id = :userId
            )
            AND (:platformName IS NULL OR :platformName = ANY(g.platforms))
            GROUP BY g.id, g.release_year
            ORDER BY COUNT(*) DESC,
                     (SELECT COUNT(*) FROM library_entries WHERE game_id = g.id) DESC,
                     g.release_year DESC NULLS LAST
            """,
            countQuery = """
            SELECT COUNT(DISTINCT g.id)
            FROM games g
            JOIN game_themes gt ON gt.game_id = g.id
            WHERE gt.theme_id IN (
                SELECT DISTINCT gt2.theme_id
                FROM library_entries le
                JOIN game_themes gt2 ON gt2.game_id = le.game_id
                WHERE le.user_id = :userId
            )
            AND g.id NOT IN (
                SELECT le.game_id FROM library_entries le WHERE le.user_id = :userId
            )
            AND (:platformName IS NULL OR :platformName = ANY(g.platforms))
            """,
            nativeQuery = true)
    Page<UUID> findThemeBasedRecommendations(
            @Param("userId") UUID userId,
            @Param("platformName") String platformName,
            Pageable pageable);

    // Returns true if the user has any rated games — used to choose recommendation strategy
    @Query(value = """
            SELECT EXISTS (
                SELECT 1 FROM library_entries
                WHERE user_id = :userId AND rating IS NOT NULL AND rating >= :minRating
            )
            """,
            nativeQuery = true)
    boolean userHasRatedGames(@Param("userId") UUID userId, @Param("minRating") int minRating);

    // Challenge generation — kept from previous version, unchanged
    @Query("SELECT g.id FROM Game g JOIN g.genres genre WHERE genre.name = :genreName")
    List<UUID> findIdsByGenreName(@Param("genreName") String genreName);

    @Query("SELECT g.id FROM Game g WHERE :genreName NOT IN (SELECT genre.name FROM g.genres genre)")
    List<UUID> findIdsNotHavingGenre(@Param("genreName") String genreName);

    @Query("SELECT genre.name FROM Game g JOIN g.genres genre GROUP BY genre.id, genre.name HAVING COUNT(g.id) >= :minCount ORDER BY genre.name")
    List<String> findGenreNamesWithMinGameCount(@Param("minCount") long minCount);
}