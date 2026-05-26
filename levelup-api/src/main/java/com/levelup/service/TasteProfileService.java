package com.levelup.service;

import com.levelup.dto.response.GenreBreakdown;
import com.levelup.dto.response.TasteProfileResponse;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.User;
import com.levelup.repository.LibraryEntryRepository;
import com.levelup.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TasteProfileService {
  private final UserRepository userRepository;
  private final LibraryEntryRepository libraryEntryRepository;

  public TasteProfileResponse getTasteProfile(String username) {
    User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(
                () -> new ResourceNotFoundException("No user exists with username: " + username));

    UUID userId = user.getId();

    List<GenreBreakdown> genres = buildGenreBreakdown(userId);
    List<String> topTags = extractNames(libraryEntryRepository.findThemeCountsByUserId(userId));
    List<String> topPlatforms =
        extractNames(libraryEntryRepository.findTopPlatformsByUserId(userId));
    Double averageRating = libraryEntryRepository.findAverageRatingByUserId(userId);
    long totalRated = libraryEntryRepository.countByUserIdAndRatingIsNotNull(userId);

    return TasteProfileResponse.builder()
        .username(username)
        .genres(genres)
        .topTags(topTags)
        .topPlatforms(topPlatforms)
        .averageRating(averageRating)
        .totalRated(totalRated)
        .compatibility(null)
        .build();
  }

  private List<GenreBreakdown> buildGenreBreakdown(UUID userId) {
    List<Object[]> rows = libraryEntryRepository.findGenreCountsByUserId(userId);
    long total = rows.stream().mapToLong(r -> (Long) r[1]).sum();
    if (total == 0) return List.of();

    return rows.stream()
        .map(
            r ->
                GenreBreakdown.builder()
                    .name((String) r[0])
                    .count((Long) r[1])
                    .percentage((int) Math.round((Long) r[1] * 100.0 / total))
                    .build())
        .toList();
  }

  private List<String> extractNames(List<Object[]> rows) {
    return rows.stream().map(r -> (String) r[0]).toList();
  }
}
