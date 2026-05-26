package com.levelup.dto.request;

import java.util.List;
import java.util.UUID;
import lombok.Data;

@Data
public class OnboardingRequest {
  private List<String> favouriteGenres;
  private List<String> platforms;
  private List<UUID> seededGameIds;
}
