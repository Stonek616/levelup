package com.levelup.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
public class Game {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "igdb_id", nullable = false, unique = true)
  private Integer igdbId;

  @Column(nullable = false)
  private String title;

  @Column() private String slug;

  @Column(name = "cover_image_id")
  private String coverImageId;

  @Column(name = "first_release_date")
  private LocalDate firstReleaseDate;

  @Column(name = "release_year")
  private Integer releaseYear;

  @Column() private String summary;
  @Column() private String storyline;

  @Column(columnDefinition = "text[]")
  private String[] platforms;

  @Column(name = "player_perspectives", columnDefinition = "text[]")
  private String[] playerPerspectives;

  @Column(name = "game_modes", columnDefinition = "text[]")
  private String[] gameModes;

  @Column(columnDefinition = "text[]")
  private String[] developers;

  @Column(columnDefinition = "text[]")
  private String[] franchises;

  @Column(name = "similar_game_ids", columnDefinition = "integer[]")
  private Integer[] similarGameIds;

  @Column(name = "cached_at", nullable = false)
  private Instant cachedAt;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "game_genres",
      joinColumns = @JoinColumn(name = "game_id"),
      inverseJoinColumns = @JoinColumn(name = "genre_id"))
  private Set<Genre> genres = new HashSet<>();

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "game_themes",
      joinColumns = @JoinColumn(name = "game_id"),
      inverseJoinColumns = @JoinColumn(name = "theme_id"))
  private Set<Theme> themes = new HashSet<>();

  @PrePersist
  private void prePersist() {
    cachedAt = Instant.now();
  }
}
