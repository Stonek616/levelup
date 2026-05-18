package com.levelup.service;

import com.levelup.dto.response.DiscoveryGameResponse;
import com.levelup.model.Game;
import com.levelup.repository.FeedEventRepository;
import com.levelup.repository.GameRepository;
import com.levelup.repository.LibraryEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiscoveryService {

    private final LibraryEntryRepository libraryEntryRepository;
    private final GameRepository gameRepository;
    private final FeedEventRepository feedEventRepository;

    public Page<DiscoveryGameResponse> getForYou(UUID userId, Pageable pageable) {
        List<String> topGenres = libraryEntryRepository.findGenreCountsByUserId(userId)
                .stream()
                .limit(5)
                .map(row -> (String) row[0])
                .toList();

        if (topGenres.isEmpty()) return Page.empty(pageable);

        Pageable unsorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Page<UUID> idPage = gameRepository.findForYouGameIds(userId, topGenres, unsorted);
        return buildPage(idPage, pageable);
    }

    public Page<DiscoveryGameResponse> getSimilar(UUID userId, Pageable pageable) {
        Pageable unsorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Page<UUID> idPage = gameRepository.findSimilarGameIds(userId, 7, unsorted);
        if (idPage.isEmpty()) return Page.empty(pageable);
        return buildPage(idPage, pageable);
    }

    public Page<DiscoveryGameResponse> getNewAndNotable(Pageable pageable) {
        int sinceYear = LocalDate.now().getYear() - 2;
        Pageable unsorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Page<Object[]> countPage = feedEventRepository.findNewAndNotableWithCounts(sinceYear, unsorted);

        if (countPage.isEmpty()) return Page.empty(pageable);

        List<UUID> gameIds = countPage.getContent().stream()
                .map(row -> (UUID) row[0])
                .toList();

        Map<UUID, Game> gamesById = gameRepository.findByIdInWithGenres(gameIds)
                .stream()
                .collect(Collectors.toMap(Game::getId, g -> g));

        List<DiscoveryGameResponse> results = gameIds.stream()
                .filter(gamesById::containsKey)
                .map(id -> DiscoveryGameResponse.from(gamesById.get(id)))
                .toList();

        return new PageImpl<>(results, pageable, countPage.getTotalElements());
    }

    private Page<DiscoveryGameResponse> buildPage(Page<UUID> idPage, Pageable pageable) {
        List<UUID> ids = idPage.getContent();
        if (ids.isEmpty()) return Page.empty(pageable);

        Map<UUID, Game> gamesById = gameRepository.findByIdInWithGenres(ids)
                .stream()
                .collect(Collectors.toMap(Game::getId, g -> g));

        List<DiscoveryGameResponse> results = ids.stream()
                .filter(gamesById::containsKey)
                .map(id -> DiscoveryGameResponse.from(gamesById.get(id)))
                .toList();

        return new PageImpl<>(results, pageable, idPage.getTotalElements());
    }
}
