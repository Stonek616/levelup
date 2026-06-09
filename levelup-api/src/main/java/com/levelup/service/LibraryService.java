package com.levelup.service;

import com.levelup.dto.request.CreateLibraryEntryRequest;
import com.levelup.dto.request.UpdateLibraryEntryRequest;
import com.levelup.dto.response.LibraryEntryResponse;
import com.levelup.exception.ConflictException;
import com.levelup.exception.ForbiddenException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.Game;
import com.levelup.model.LibraryEntry;
import com.levelup.model.User;
import com.levelup.model.enums.FeedEventType;
import com.levelup.model.enums.LibraryStatus;
import com.levelup.model.enums.OwnershipStatus;
import com.levelup.model.enums.VisibilityType;
import com.levelup.repository.GameRepository;
import com.levelup.repository.LibraryEntryRepository;
import com.levelup.repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LibraryService {

  private final LibraryEntryRepository libraryEntryRepository;
  private final GameRepository gameRepository;
  private final UserRepository userRepository;
  private final FeedService feedService;
  private final FriendService friendService;

  public Page<LibraryEntryResponse> getUserLibrary(
      UUID userId,
      LibraryStatus status,
      OwnershipStatus ownership,
      String platform,
      Pageable pageable) {
    return libraryEntryRepository
        .findWithFilters(
            userId,
            status != null ? status.name() : null,
            ownership != null ? ownership.name() : null,
            platform,
            pageable)
        .map(LibraryEntryResponse::from);
  }

  public Page<LibraryEntryResponse> getUserLibraryForViewer(
      String username,
      UUID currentUserId,
      LibraryStatus status,
      OwnershipStatus ownership,
      String platform,
      Pageable pageable) {
    User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    boolean isOwn = currentUserId != null && currentUserId.equals(user.getId());
    if (!isOwn) {
      VisibilityType vis = user.getLibraryVisibility();
      if (vis == VisibilityType.PRIVATE) {
        throw new ForbiddenException("This library is private");
      }
      if (vis == VisibilityType.FRIENDS
          && (currentUserId == null
              || !friendService.areUsersFriends(currentUserId, user.getId()))) {
        throw new ForbiddenException("This library is only visible to friends");
      }
    }
    return getUserLibrary(user.getId(), status, ownership, platform, pageable);
  }

  @Transactional
  public LibraryEntryResponse addToLibrary(UUID userId, CreateLibraryEntryRequest request) {
    Game game =
        gameRepository
            .findById(request.getGameId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Game with id '" + request.getGameId() + "' not found"));
    if (libraryEntryRepository.existsByUserIdAndGameId(userId, request.getGameId())) {
      throw new ConflictException("Game is already in your library");
    }
    if (request.getOwnership() == OwnershipStatus.WISHLIST && request.getStatus() != null) {
      throw new IllegalArgumentException("WISHLIST entries cannot have a status");
    }

    LibraryEntry entry = new LibraryEntry();
    User user = userRepository.getReferenceById(userId);
    entry.setUser(user);
    entry.setGame(game);
    entry.setOwnership(request.getOwnership());
    entry.setStatus(request.getStatus());
    entry.setPlatforms(
        request.getPlatforms() != null
            ? request.getPlatforms().toArray(new String[0])
            : new String[0]);
    LibraryEntry saved = libraryEntryRepository.save(entry);

    String statusName = saved.getStatus() != null ? saved.getStatus().name() : "NONE";
    feedService.emitFeedEvent(
        userId,
        game.getId(),
        FeedEventType.GAME_ADDED,
        String.format("{\"status\":\"%s\"}", statusName));
    return LibraryEntryResponse.from(saved);
  }

  @Transactional
  public LibraryEntryResponse updateEntry(
      UUID entryId, UUID requestingUserId, UpdateLibraryEntryRequest request) {
    LibraryEntry entry =
        libraryEntryRepository
            .findById(entryId)
            .orElseThrow(() -> new ResourceNotFoundException("Library entry not found"));

    if (!entry.getUser().getId().equals(requestingUserId)) {
      throw new ForbiddenException("You do not own this library entry");
    }

    LibraryStatus oldStatus = entry.getStatus();
    OwnershipStatus oldOwnership = entry.getOwnership();

    if (request.getOwnership() != null) {
      OwnershipStatus newOwnership = request.getOwnership();

      if (newOwnership == OwnershipStatus.WISHLIST) {
        // Moving to WISHLIST clears the status
        entry.setOwnership(OwnershipStatus.WISHLIST);
        entry.setStatus(null);
      } else {
        // Moving from WISHLIST to OWNED/NONE — auto-assign BACKLOG if no status yet
        if (oldOwnership == OwnershipStatus.WISHLIST && newOwnership == OwnershipStatus.OWNED) {
          entry.setStatus(LibraryStatus.BACKLOG);
        }
        entry.setOwnership(newOwnership);
      }
    }

    // Only apply explicit status update if not overridden by an ownership→WISHLIST transition
    if (request.getStatus() != null && entry.getOwnership() != OwnershipStatus.WISHLIST) {
      entry.setStatus(request.getStatus());
    }

    if (request.getPlatforms() != null)
      entry.setPlatforms(request.getPlatforms().toArray(new String[0]));
    if (request.getRating() != null) entry.setRating(request.getRating());

    LibraryEntry saved = libraryEntryRepository.save(entry);
    UUID gameId = saved.getGame().getId();

    LibraryStatus newStatus = saved.getStatus();
    if (!statusEquals(oldStatus, newStatus)) {
      String oldName = oldStatus != null ? oldStatus.name() : "NONE";
      String newName = newStatus != null ? newStatus.name() : "NONE";
      feedService.emitFeedEvent(
          requestingUserId,
          gameId,
          FeedEventType.STATUS_CHANGE,
          String.format("{\"oldStatus\":\"%s\",\"newStatus\":\"%s\"}", oldName, newName));
    }
    if (request.getRating() != null) {
      feedService.emitFeedEvent(
          requestingUserId,
          gameId,
          FeedEventType.RATING_ADDED,
          String.format("{\"rating\":%d}", request.getRating()));
    }

    return LibraryEntryResponse.from(saved);
  }

  @Transactional
  public void deleteEntry(UUID entryId, UUID requestingUserId) {
    LibraryEntry entry =
        libraryEntryRepository
            .findById(entryId)
            .orElseThrow(() -> new ResourceAccessException("Library entry not found"));
    if (!entry.getUser().getId().equals(requestingUserId)) {
      throw new ForbiddenException("You do not own this library entry");
    }
    libraryEntryRepository.delete(entry);
  }

  public LibraryEntryResponse getEntryByGame(UUID userId, UUID gameId) {
    return libraryEntryRepository
        .findByUserIdAndGameId(userId, gameId)
        .map(LibraryEntryResponse::from)
        .orElseThrow(() -> new ResourceNotFoundException("No library entry for this game"));
  }

  private boolean statusEquals(LibraryStatus a, LibraryStatus b) {
    return (a == null && b == null) || (a != null && a.equals(b));
  }
}
