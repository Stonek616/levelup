package com.levelup.controller;

import com.levelup.dto.request.AddGameToCollectionRequest;
import com.levelup.dto.request.CreateCollectionRequest;
import com.levelup.dto.request.UpdateCollectionRequest;
import com.levelup.dto.response.CollectionResponse;
import com.levelup.dto.response.CollectionSummaryResponse;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.CollectionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CollectionController {

  private final CollectionService collectionService;

  @PostMapping("/api/v1/collections")
  public ResponseEntity<CollectionResponse> createCollection(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @Valid @RequestBody CreateCollectionRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(collectionService.createCollection(userDetails.getId(), request));
  }

  @GetMapping("/api/v1/collections/{id}")
  public ResponseEntity<CollectionResponse> getCollection(
      @PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
    UUID requestingUserId = userDetails != null ? userDetails.getId() : null;
    return ResponseEntity.ok(collectionService.getCollection(id, requestingUserId));
  }

  @PatchMapping("/api/v1/collections/{id}")
  public ResponseEntity<CollectionResponse> updateCollection(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @Valid @RequestBody UpdateCollectionRequest request) {
    return ResponseEntity.ok(collectionService.updateCollection(id, userDetails.getId(), request));
  }

  @DeleteMapping("/api/v1/collections/{id}")
  public ResponseEntity<Void> deleteCollection(
      @PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
    collectionService.deleteCollection(id, userDetails.getId());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/api/v1/collections/{id}/games")
  public ResponseEntity<CollectionResponse> addGame(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @Valid @RequestBody AddGameToCollectionRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(collectionService.addGame(id, userDetails.getId(), request));
  }

  @DeleteMapping("/api/v1/collections/{id}/games/{gameId}")
  public ResponseEntity<Void> removeGame(
      @PathVariable UUID id,
      @PathVariable UUID gameId,
      @AuthenticationPrincipal UserDetailsImpl userDetails) {
    collectionService.removeGame(id, gameId, userDetails.getId());
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/api/v1/users/{username}/collections")
  public ResponseEntity<List<CollectionSummaryResponse>> getUserCollections(
      @PathVariable String username, @AuthenticationPrincipal UserDetailsImpl userDetails) {
    UUID requestingUserId = userDetails != null ? userDetails.getId() : null;
    return ResponseEntity.ok(collectionService.getUserCollections(username, requestingUserId));
  }
}
