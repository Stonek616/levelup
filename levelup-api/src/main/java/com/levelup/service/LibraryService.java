package com.levelup.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;

import com.levelup.dto.request.CreateLibraryEntryRequest;
import com.levelup.dto.response.LibraryEntryResponse;
import com.levelup.exception.ConflictException;
import com.levelup.exception.ForbiddenException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.LibraryEntry;
import com.levelup.model.enums.LibraryStatus;
import com.levelup.repository.GameRepository;
import com.levelup.repository.LibraryEntryRepository;
import com.levelup.repository.UserRepository;
import com.levelup.model.Game;
import com.levelup.model.User;
import com.levelup.model.enums.FeedEventType;
import com.levelup.dto.request.UpdateLibraryEntryRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryEntryRepository libraryEntryRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final FeedService feedService;

    public Page<LibraryEntryResponse> getUserLibrary(
            UUID userId, LibraryStatus status, Boolean owned, String platform, Pageable pageable) {
        return libraryEntryRepository
                .findWithFilters(userId, status != null ? status.name() : null, owned, platform, pageable)
                .map(LibraryEntryResponse::from);
    }

    public LibraryEntryResponse addToLibrary(
            UUID userId, CreateLibraryEntryRequest request) {
        LibraryEntry libraryEntry = new LibraryEntry();
        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Game with id '" + request.getGameId() + "' not found"));
        if (libraryEntryRepository.existsByUserIdAndGameId(userId, request.getGameId())) {
            throw new ConflictException("Game is already in your library");
        }

        User user = userRepository.getReferenceById(userId);
        libraryEntry.setUser(user);
        libraryEntry.setGame(game);
        libraryEntry.setStatus(request.getStatus());
        libraryEntry.setOwned(request.getIsOwned());
        libraryEntry.setPlatforms(
                request.getPlatforms() != null ? request.getPlatforms().toArray(new String[0]) : new String[0]);
        LibraryEntry saved = libraryEntryRepository.save(libraryEntry);
        feedService.emitFeedEvent(userId, game.getId(), FeedEventType.GAME_ADDED,
                String.format("{\"status\":\"%s\"}", request.getStatus().name()));
        return LibraryEntryResponse.from(saved);
    }

    public LibraryEntryResponse updateEntry(
            UUID entryId, UUID requestingUserId,
            UpdateLibraryEntryRequest request) {
        LibraryEntry entry = libraryEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Library entry not found"));

        if (!entry.getUser().getId().equals(requestingUserId)) {
            throw new ForbiddenException("You do not own this library entry");
        }

        LibraryStatus oldStatus = entry.getStatus();

        if (request.getStatus() != null)
            entry.setStatus(request.getStatus());
        if (request.getIsOwned() != null)
            entry.setOwned(request.getIsOwned());
        if (request.getPlatforms() != null)
            entry.setPlatforms(request.getPlatforms().toArray(new String[0]));
        if (request.getRating() != null)
            entry.setRating(request.getRating());

        LibraryEntry saved = libraryEntryRepository.save(entry);

        UUID gameId = saved.getGame().getId();
        if (request.getStatus() != null && !request.getStatus().equals(oldStatus)) {
            feedService.emitFeedEvent(requestingUserId, gameId, FeedEventType.STATUS_CHANGE,
                    String.format("{\"oldStatus\":\"%s\",\"newStatus\":\"%s\"}",
                            oldStatus.name(), request.getStatus().name()));
        }
        if (request.getRating() != null) {
            feedService.emitFeedEvent(requestingUserId, gameId, FeedEventType.RATING_ADDED,
                    String.format("{\"rating\":%d}", request.getRating()));
        }

        return LibraryEntryResponse.from(saved);
    }

    public void deleteEntry(UUID entryId, UUID requestingUserId) {
        LibraryEntry entry = libraryEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceAccessException("Library entry not found"));
        if (!entry.getUser().getId().equals(requestingUserId)) {
            throw new ForbiddenException("You do not own this library entry");
        }
        libraryEntryRepository.delete(entry);
    }

    public LibraryEntryResponse getEntryByGame(UUID userId, UUID gameId) {
        return libraryEntryRepository.findByUserIdAndGameId(userId, gameId)
                .map(LibraryEntryResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("No library entry for this game"));
    }
}
