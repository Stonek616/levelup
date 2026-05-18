package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TasteProfileResponse {
    private String username;
    private List<GenreBreakdown> genres;
    private List<String> topTags;
    private List<String> topPlatforms;
    private Double averageRating;
    private long totalRated;
    private Integer compatibility;
}
