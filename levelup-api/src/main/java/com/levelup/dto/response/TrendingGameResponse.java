package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendingGameResponse {
    private UUID id;
    private String title;
    private String coverImageId;
    private List<String> genres;
    private Double communityRating;
    private Long totalRatings;
    private Long recentActivity;
}
