package com.levelup.igdb;

import com.levelup.igdb.dto.IgdbTaxonomyDto;
import com.levelup.model.Genre;
import com.levelup.model.Theme;
import com.levelup.repository.GenreRepository;
import com.levelup.repository.ThemeRepository;
import com.levelup.util.SlugUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class IgdbTaxonomyIngestionService {

    private static final Logger log = LoggerFactory.getLogger(IgdbTaxonomyIngestionService.class);

    private static final int BATCH_SIZE = 500;
    private static final ParameterizedTypeReference<List<IgdbTaxonomyDto>> TAXONOMY_LIST_TYPE =
            new ParameterizedTypeReference<>() {};

    private final IgdbClient igdbClient;
    private final GenreRepository genreRepository;
    private final ThemeRepository themeRepository;
    private final JdbcTemplate jdbcTemplate;

    public IgdbTaxonomyIngestionService(
            IgdbClient igdbClient,
            GenreRepository genreRepository,
            ThemeRepository themeRepository,
            JdbcTemplate jdbcTemplate) {
        this.igdbClient = igdbClient;
        this.genreRepository = genreRepository;
        this.themeRepository = themeRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void ingestGenres() {
        log.info("Starting genre ingestion");
        List<IgdbTaxonomyDto> genres = fetchAll("/genres");
        log.info("Fetched {} genres from IGDB", genres.size());

        List<Genre> entities = genres.stream()
                .map(dto -> {
                    Genre g = new Genre();
                    g.setId(dto.id());
                    g.setName(dto.name());
                    g.setSlug(SlugUtil.slugify(dto.name()));
                    return g;
                })
                .toList();

        genreRepository.saveAll(entities);
        log.info("Saved {} genres to database", entities.size());
    }

    @Transactional
    public void ingestThemes() {
        log.info("Starting theme ingestion");
        List<IgdbTaxonomyDto> themes = fetchAll("/themes");
        log.info("Fetched {} themes from IGDB", themes.size());

        List<Theme> entities = themes.stream()
                .map(dto -> {
                    Theme t = new Theme();
                    t.setId(dto.id());
                    t.setName(dto.name());
                    t.setSlug(SlugUtil.slugify(dto.name()));
                    return t;
                })
                .toList();

        themeRepository.saveAll(entities);
        log.info("Saved {} themes to database", entities.size());
    }

    /**
     * Keywords use JdbcTemplate batch upsert directly because there are
     * 50k+ rows and Spring Data JPA's per-entity overhead is wasteful at this volume.
     */
 @Transactional
public void ingestKeywords() {
    log.info("Starting keyword ingestion");

    String sql = """
            INSERT INTO keywords (id, name, slug, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE
              SET name = EXCLUDED.name,
                  slug = EXCLUDED.slug,
                  updated_at = EXCLUDED.updated_at
            """;

    Instant now = Instant.now();
    int offset = 0;
    int total = 0;

    while (true) {
        String query = String.format(
                "fields id, name; sort id asc; limit %d; offset %d;",
                BATCH_SIZE, offset
        );

        List<IgdbTaxonomyDto> batch = igdbClient.query(
                "/keywords", query, TAXONOMY_LIST_TYPE);

        if (batch == null || batch.isEmpty()) {
            break;
        }

        jdbcTemplate.batchUpdate(sql, batch, BATCH_SIZE, (ps, kw) -> {


            ps.setInt(1, kw.id());
            ps.setString(2, kw.name());
            ps.setString(3, SlugUtil.slugify(kw.name()));
            ps.setTimestamp(4, java.sql.Timestamp.from(now));
            ps.setTimestamp(5, java.sql.Timestamp.from(now));
        });

        total += batch.size();

        log.info("Inserted batch of {} (total: {})", batch.size(), total);

        if (batch.size() < BATCH_SIZE) {
            break;
        }

        offset += BATCH_SIZE;

        sleepForRateLimit();
    }

    log.info("Finished keyword ingestion. Total inserted: {}", total);
}

private void sleepForRateLimit() {
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException("Interrupted while rate limiting IGDB requests", e);
    }
}

    /**
     * Paginates through an IGDB endpoint, pulling 500 records at a time
     * until an empty response signals we've hit the end.
     */
    private List<IgdbTaxonomyDto> fetchAll(String endpoint) {
        java.util.ArrayList<IgdbTaxonomyDto> all = new java.util.ArrayList<>();
        int offset = 0;

        while (true) {
            String query = String.format(
                    "fields id, name; sort id asc; limit %d; offset %d;",
                    BATCH_SIZE, offset
            );

            List<IgdbTaxonomyDto> batch = igdbClient.query(
                    endpoint, query, TAXONOMY_LIST_TYPE);

            if (batch == null || batch.isEmpty()) {
                break;
            }

            all.addAll(batch);
            log.info("  Fetched {} rows from {} (offset {}, total so far: {})",
                    batch.size(), endpoint, offset, all.size());

            // If we got fewer rows than the page size, we've reached the end
            if (batch.size() < BATCH_SIZE) {
                break;
            }

            offset += BATCH_SIZE;
            sleepForRateLimit();
        }

        return all;
    }
}