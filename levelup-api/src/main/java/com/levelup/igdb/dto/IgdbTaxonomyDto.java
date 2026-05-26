package com.levelup.igdb.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record IgdbTaxonomyDto(@JsonProperty("id") Integer id, @JsonProperty("name") String name) {}
