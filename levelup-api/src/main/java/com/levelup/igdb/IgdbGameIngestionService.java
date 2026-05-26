package com.levelup.igdb;

import com.levelup.igdb.dto.IgdbGameDto;
import com.levelup.model.Game;
import com.levelup.repository.GameRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IgdbGameIngestionService {

  private static final Logger log = LoggerFactory.getLogger(IgdbGameIngestionService.class);

  private static final int BATCH_SIZE = 500;
  private static final ParameterizedTypeReference<List<IgdbGameDto>> GAME_LIST_TYPE =
      new ParameterizedTypeReference<>() {};

  /**
   * Apicalypse query for the /games endpoint.
   *
   * <p>Filters: total_rating_count > 20 — games with enough community engagement to be recognizable
   * version_parent = null — skip "Game of the Year Edition" duplicates of the main game game_type =
   * 0 — main games only, no DLC/expansions/bundles
   *
   * <p>Sort by total_rating_count desc to get the most popular games first, so even if we cap at
   * 5000 we get the games people will actually search for.
   */
  private static final String GAME_QUERY_FIELDS =
      """
            fields
              id, name, slug, summary, storyline, first_release_date,
              genres, themes, keywords, similar_games,
              cover.image_id,
              platforms.name,
              player_perspectives.name,
              game_modes.name,
              franchises.name,
              involved_companies.developer,
              involved_companies.publisher,
              involved_companies.company.name;
            where total_rating_count > 20
              & version_parent = null
              & game_type = 0;
            sort total_rating_count desc;
            """;

  private final IgdbClient igdbClient;
  private final GameRepository gameRepository;
  private final JdbcTemplate jdbcTemplate;

  public IgdbGameIngestionService(
      IgdbClient igdbClient, GameRepository gameRepository, JdbcTemplate jdbcTemplate) {
    this.igdbClient = igdbClient;
    this.gameRepository = gameRepository;
    this.jdbcTemplate = jdbcTemplate;
  }

  /**
   * Ingests up to `maxGames` games from IGDB, paginated. Each game and its join rows are written in
   * a single transaction so a partial failure leaves no orphan rows.
   */
  public void ingestGames(int maxGames) {
    log.info("Starting game ingestion (target: {} games)", maxGames);

    int offset = 0;
    int totalIngested = 0;

    while (totalIngested < maxGames) {
      int limit = Math.min(BATCH_SIZE, maxGames - totalIngested);
      String query = GAME_QUERY_FIELDS + String.format(" limit %d; offset %d;", limit, offset);

      List<IgdbGameDto> batch = igdbClient.query("/games", query, GAME_LIST_TYPE);

      if (batch == null || batch.isEmpty()) {
        log.info("IGDB returned no more games — stopping at {}", totalIngested);
        break;
      }

      log.info("Fetched batch of {} games (offset {}), processing...", batch.size(), offset);

      for (IgdbGameDto dto : batch) {
        try {
          ingestSingleGame(dto);
          totalIngested++;
        } catch (Exception e) {
          log.error("Failed to ingest game {} ({}): {}", dto.id(), dto.name(), e.getMessage());
        }
      }

      log.info("Total ingested so far: {}/{}", totalIngested, maxGames);

      if (batch.size() < limit) {
        log.info("Last page — IGDB returned fewer than requested");
        break;
      }

      offset += BATCH_SIZE;
      sleepForRateLimit();
    }

    log.info("Game ingestion complete. Total: {}", totalIngested);
  }

  /**
   * Upserts a single game and its taxonomy join rows in one transaction. Idempotent — running
   * ingestion twice updates the row in place rather than failing.
   */
  @Transactional
  protected void ingestSingleGame(IgdbGameDto dto) {
    // Find existing or create new. We use igdb_id as the natural key.
    Game game = gameRepository.findByIgdbId(dto.id()).orElseGet(Game::new);

    game.setIgdbId(dto.id());
    game.setTitle(dto.name());
    game.setSlug(dto.slug());
    game.setSummary(dto.summary());
    game.setStoryline(dto.storyline());

    if (dto.firstReleaseDate() != null) {
      LocalDate releaseDate =
          LocalDate.ofInstant(Instant.ofEpochSecond(dto.firstReleaseDate()), ZoneOffset.UTC);
      game.setFirstReleaseDate(releaseDate);
      game.setReleaseYear(releaseDate.getYear());
    }

    if (dto.cover() != null) {
      game.setCoverImageId(dto.cover().imageId());
    }

    game.setPlatforms(extractNames(dto.platforms()));
    game.setPlayerPerspectives(extractNames(dto.playerPerspectives()));
    game.setGameModes(extractNames(dto.gameModes()));
    game.setFranchises(extractNames(dto.franchises()));
    game.setDevelopers(extractDevelopers(dto.involvedCompanies()));
    game.setSimilarGameIds(toIntegerArray(dto.similarGameIds()));
    game.setCachedAt(Instant.now());

    Game saved = gameRepository.save(game);

    // Replace join rows wholesale on each ingestion so we don't accumulate
    // stale references if IGDB removes a genre from a game between runs.
    replaceJoinRows("game_genres", "genre_id", saved.getId(), dto.genreIds());
    replaceJoinRows("game_themes", "theme_id", saved.getId(), dto.themeIds());
    replaceJoinRows("game_keywords", "keyword_id", saved.getId(), dto.keywordIds());
  }

  /**
   * Deletes existing join rows for a game and inserts fresh ones from the IGDB response. This keeps
   * the join tables in sync if IGDB adds/removes taxonomy on a re-run.
   */
  private void replaceJoinRows(String table, String fkColumn, UUID gameId, List<Integer> ids) {
    jdbcTemplate.update("DELETE FROM " + table + " WHERE game_id = ?", gameId);

    if (ids == null || ids.isEmpty()) {
      return;
    }

    String sql =
        String.format(
            "INSERT INTO %s (game_id, %s) VALUES (?, ?) ON CONFLICT DO NOTHING", table, fkColumn);

    jdbcTemplate.batchUpdate(
        sql,
        ids,
        ids.size(),
        (ps, id) -> {
          ps.setObject(1, gameId);
          ps.setInt(2, id);
        });
  }

  private String[] extractNames(List<IgdbGameDto.IgdbNamed> items) {
    if (items == null || items.isEmpty()) {
      return new String[0];
    }
    return items.stream()
        .map(IgdbGameDto.IgdbNamed::name)
        .filter(n -> n != null)
        .toArray(String[]::new);
  }

  private String[] extractDevelopers(List<IgdbGameDto.IgdbInvolvedCompany> companies) {
    if (companies == null || companies.isEmpty()) {
      return new String[0];
    }
    return companies.stream()
        .filter(c -> Boolean.TRUE.equals(c.developer()))
        .map(c -> c.company() != null ? c.company().name() : null)
        .filter(n -> n != null)
        .toArray(String[]::new);
  }

  private Integer[] toIntegerArray(List<Integer> list) {
    if (list == null || list.isEmpty()) {
      return new Integer[0];
    }
    return list.toArray(new Integer[0]);
  }

  private void sleepForRateLimit() {
    try {
      Thread.sleep(1000);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException("Interrupted while rate limiting IGDB requests", e);
    }
  }
}
