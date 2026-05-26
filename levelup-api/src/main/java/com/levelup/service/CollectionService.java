package com.levelup.service;

import com.levelup.dto.request.AddGameToCollectionRequest;
import com.levelup.dto.request.CreateCollectionRequest;
import com.levelup.dto.request.UpdateCollectionRequest;
import com.levelup.dto.response.CollectionResponse;
import com.levelup.dto.response.CollectionSummaryResponse;
import com.levelup.exception.ConflictException;
import com.levelup.exception.ForbiddenException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.Collection;
import com.levelup.model.CollectionItem;
import com.levelup.model.enums.VisibilityType;
import com.levelup.repository.CollectionItemRepository;
import com.levelup.repository.CollectionRepository;
import com.levelup.repository.FriendshipRepository;
import com.levelup.repository.GameRepository;
import com.levelup.repository.UserRepository;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionService {

  private final CollectionRepository collectionRepository;
  private final CollectionItemRepository collectionItemRepository;
  private final UserRepository userRepository;
  private final GameRepository gameRepository;
  private final FriendshipRepository friendshipRepository;

  @Transactional
  public CollectionResponse createCollection(UUID userId, CreateCollectionRequest request) {
    Collection collection = new Collection();
    collection.setOwner(userRepository.getReferenceById(userId));
    collection.setName(request.getName());
    collection.setDescription(request.getDescription());
    collection.setVisibility(
        request.getVisibility() != null ? request.getVisibility() : VisibilityType.PUBLIC);
    collectionRepository.save(collection);
    return CollectionResponse.from(collection, List.of());
  }

  public List<CollectionSummaryResponse> getMyCollections(UUID userId) {
    List<Collection> collections = collectionRepository.findByOwnerIdOrderByCreatedAtDesc(userId);
    return buildSummaries(collections);
  }

  public CollectionResponse getCollection(UUID collectionId, UUID requestingUserId) {
    Collection collection =
        collectionRepository
            .findById(collectionId)
            .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
    checkReadAccess(collection, requestingUserId);
    List<CollectionItem> items = collectionItemRepository.findByCollectionIdWithGame(collectionId);
    return CollectionResponse.from(collection, items);
  }

  @Transactional
  public CollectionResponse updateCollection(
      UUID collectionId, UUID userId, UpdateCollectionRequest request) {
    Collection collection =
        collectionRepository
            .findById(collectionId)
            .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
    requireOwner(collection, userId);

    if (request.getName() != null) collection.setName(request.getName());
    if (request.getDescription() != null) collection.setDescription(request.getDescription());
    if (request.getVisibility() != null) collection.setVisibility(request.getVisibility());

    List<CollectionItem> items = collectionItemRepository.findByCollectionIdWithGame(collectionId);
    return CollectionResponse.from(collection, items);
  }

  @Transactional
  public void deleteCollection(UUID collectionId, UUID userId) {
    Collection collection =
        collectionRepository
            .findById(collectionId)
            .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
    requireOwner(collection, userId);
    collectionRepository.delete(collection);
  }

  @Transactional
  public CollectionResponse addGame(
      UUID collectionId, UUID userId, AddGameToCollectionRequest request) {
    Collection collection =
        collectionRepository
            .findById(collectionId)
            .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
    requireOwner(collection, userId);

    if (!gameRepository.existsById(request.getGameId())) {
      throw new ResourceNotFoundException("Game not found");
    }
    if (collectionItemRepository.existsByCollectionIdAndGameId(collectionId, request.getGameId())) {
      throw new ConflictException("Game is already in this collection");
    }

    CollectionItem item = new CollectionItem();
    item.setCollection(collectionRepository.getReferenceById(collectionId));
    item.setGame(gameRepository.getReferenceById(request.getGameId()));
    collectionItemRepository.save(item);

    List<CollectionItem> items = collectionItemRepository.findByCollectionIdWithGame(collectionId);
    return CollectionResponse.from(collection, items);
  }

  @Transactional
  public void removeGame(UUID collectionId, UUID gameId, UUID userId) {
    Collection collection =
        collectionRepository
            .findById(collectionId)
            .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
    requireOwner(collection, userId);

    if (!collectionItemRepository.existsByCollectionIdAndGameId(collectionId, gameId)) {
      throw new ResourceNotFoundException("Game is not in this collection");
    }
    collectionItemRepository.deleteByCollectionIdAndGameId(collectionId, gameId);
  }

  public List<CollectionSummaryResponse> getUserCollections(
      String username, UUID requestingUserId) {
    userRepository
        .findByUsername(username)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    List<VisibilityType> visibilities = resolveVisibilities(username, requestingUserId);
    List<Collection> collections =
        collectionRepository.findByOwnerUsernameAndVisibilityIn(username, visibilities);
    return buildSummaries(collections);
  }

  private List<VisibilityType> resolveVisibilities(String ownerUsername, UUID requestingUserId) {
    if (requestingUserId == null) {
      return List.of(VisibilityType.PUBLIC);
    }
    // Check if the requester is the owner
    return userRepository
        .findByUsername(ownerUsername)
        .map(
            owner -> {
              if (owner.getId().equals(requestingUserId)) {
                return List.of(
                    VisibilityType.PUBLIC, VisibilityType.FRIENDS, VisibilityType.PRIVATE);
              }
              if (friendshipRepository.existsByUserIdAndFriendId(requestingUserId, owner.getId())) {
                return List.of(VisibilityType.PUBLIC, VisibilityType.FRIENDS);
              }
              return List.of(VisibilityType.PUBLIC);
            })
        .orElse(List.of(VisibilityType.PUBLIC));
  }

  private void checkReadAccess(Collection collection, UUID requestingUserId) {
    VisibilityType v = collection.getVisibility();
    if (v == VisibilityType.PUBLIC) return;
    if (requestingUserId == null) throw new ForbiddenException("Authentication required");

    UUID ownerId = collection.getOwner().getId();
    if (requestingUserId.equals(ownerId)) return;
    if (v == VisibilityType.FRIENDS
        && friendshipRepository.existsByUserIdAndFriendId(requestingUserId, ownerId)) return;

    throw new ForbiddenException("You do not have access to this collection");
  }

  private void requireOwner(Collection collection, UUID userId) {
    if (!collection.getOwner().getId().equals(userId)) {
      throw new ForbiddenException("You do not own this collection");
    }
  }

  private List<CollectionSummaryResponse> buildSummaries(List<Collection> collections) {
    return collections.stream()
        .map(
            c -> {
              List<CollectionItem> items =
                  collectionItemRepository.findByCollectionIdWithGame(c.getId());
              List<String> previewCoverIds =
                  items.stream()
                      .map(item -> item.getGame().getCoverImageId())
                      .filter(Objects::nonNull)
                      .limit(4)
                      .toList();
              return CollectionSummaryResponse.from(c, items.size(), previewCoverIds);
            })
        .toList();
  }
}
