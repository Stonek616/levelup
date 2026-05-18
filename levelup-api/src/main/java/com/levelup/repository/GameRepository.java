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

    // Loads a batch of games with genres in one query — used by trending to avoid N+1
    @Query("SELECT g FROM Game g LEFT JOIN FETCH g.genres WHERE g.id IN :ids")
    List<Game> findByIdInWithGenres(@Param("ids") List<UUID> ids);

    // For You — games not in user's library that match their preferred genres
    @Query(value = """
            SELECT g.id FROM Game g
            JOIN g.genres genre
            WHERE genre.name IN :genreNames
            AND g.id NOT IN (SELECT le.game.id FROM LibraryEntry le WHERE le.user.id = :userId)
            GROUP BY g.id, g.releaseYear
            ORDER BY g.releaseYear DESC NULLS LAST
            """,
            countQuery = """
            SELECT COUNT(DISTINCT g.id) FROM Game g
            JOIN g.genres genre
            WHERE genre.name IN :genreNames
            AND g.id NOT IN (SELECT le.game.id FROM LibraryEntry le WHERE le.user.id = :userId)
            """)
    Page<UUID> findForYouGameIds(
            @Param("userId") UUID userId,
            @Param("genreNames") List<String> genreNames,
            Pageable pageable);

    // Similar — games sharing genres with the user's highly-rated games
    @Query(value = """
            SELECT g.id FROM Game g
            JOIN g.genres genre
            WHERE genre.name IN (
                SELECT DISTINCT genre2.name FROM LibraryEntry le2
                JOIN le2.game.genres genre2
                WHERE le2.user.id = :userId AND le2.rating >= :minRating
            )
            AND g.id NOT IN (SELECT le.game.id FROM LibraryEntry le WHERE le.user.id = :userId)
            GROUP BY g.id, g.releaseYear
            ORDER BY g.releaseYear DESC NULLS LAST
            """,
            countQuery = """
            SELECT COUNT(DISTINCT g.id) FROM Game g
            JOIN g.genres genre
            WHERE genre.name IN (
                SELECT DISTINCT genre2.name FROM LibraryEntry le2
                JOIN le2.game.genres genre2
                WHERE le2.user.id = :userId AND le2.rating >= :minRating
            )
            AND g.id NOT IN (SELECT le.game.id FROM LibraryEntry le WHERE le.user.id = :userId)
            """)
    Page<UUID> findSimilarGameIds(
            @Param("userId") UUID userId,
            @Param("minRating") int minRating,
            Pageable pageable);
}