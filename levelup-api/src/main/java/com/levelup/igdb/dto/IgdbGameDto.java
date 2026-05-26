package com.levelup.igdb.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Maps the IGDB /games response with our chosen expander fields.
 *
 * <p>Fields like genres/themes/keywords stay as raw ID arrays — we have those names in our own
 * taxonomy tables already, no point pulling them again.
 *
 * <p>Fields like platforms/game_modes/etc. are expanded so we get names directly, and we store
 * those denormalized as TEXT[] on the games row. @JsonIgnoreProperties(ignoreUnknown = true) means
 * IGDB can return extra fields we don't care about without breaking deserialization.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record IgdbGameDto(
    @JsonProperty("id") Integer id,
    @JsonProperty("name") String name,
    @JsonProperty("slug") String slug,
    @JsonProperty("summary") String summary,
    @JsonProperty("storyline") String storyline,
    @JsonProperty("first_release_date") Long firstReleaseDate, // Unix timestamp seconds

    // ID arrays — we resolve via our own taxonomy tables
    @JsonProperty("genres") List<Integer> genreIds,
    @JsonProperty("themes") List<Integer> themeIds,
    @JsonProperty("keywords") List<Integer> keywordIds,
    @JsonProperty("similar_games") List<Integer> similarGameIds,

    // Expanded objects — denormalized into TEXT[] on the games row
    @JsonProperty("cover") IgdbCover cover,
    @JsonProperty("platforms") List<IgdbNamed> platforms,
    @JsonProperty("player_perspectives") List<IgdbNamed> playerPerspectives,
    @JsonProperty("game_modes") List<IgdbNamed> gameModes,
    @JsonProperty("franchises") List<IgdbNamed> franchises,
    @JsonProperty("involved_companies") List<IgdbInvolvedCompany> involvedCompanies) {
  /** A simple {id, name} object that many IGDB endpoints return when expanded. */
  @JsonIgnoreProperties(ignoreUnknown = true)
  public record IgdbNamed(@JsonProperty("id") Integer id, @JsonProperty("name") String name) {}

  /** Cover only needs the image_id; we template the URL ourselves at render time. */
  @JsonIgnoreProperties(ignoreUnknown = true)
  public record IgdbCover(
      @JsonProperty("id") Integer id, @JsonProperty("image_id") String imageId) {}

  /**
   * involved_companies has a join structure — it tells you whether a company was the developer,
   * publisher, both, or neither. We only care about developers for now (per the design doc —
   * publishers don't drive recommendations).
   */
  @JsonIgnoreProperties(ignoreUnknown = true)
  public record IgdbInvolvedCompany(
      @JsonProperty("developer") Boolean developer,
      @JsonProperty("publisher") Boolean publisher,
      @JsonProperty("company") IgdbNamed company) {}
}
