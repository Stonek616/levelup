package com.levelup.repository;

import com.levelup.model.Game;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface GameRepository extends JpaRepository<Game, UUID> {
    Optional<Game> findByIgdbId(Integer igdbId);
    List<Game> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    @Query("Select g FROM Game g LEFT JOIN FETCH g.genres LEFT JOIN FETCH g.themes where g.id = :id")
    Optional<Game> findByIdWithGenresAndThemes(@Param("id") UUID id);
}