package com.levelup.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class OnboardingRequest {
    private List<String> favouriteGenres;
    private List<String> platforms;
    private List<UUID> seededGameIds;
}
