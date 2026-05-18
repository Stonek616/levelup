package com.levelup.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.levelup.dto.request.RespondToFriendRequestRequest;
import com.levelup.dto.request.SendFriendRequestRequest;
import com.levelup.dto.response.FriendRequestActionResponse;
import com.levelup.dto.response.FriendRequestResponse;
import com.levelup.dto.response.FriendshipResponse;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.FriendService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    public ResponseEntity<Page<FriendshipResponse>> getFriends(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(friendService.getFriends(userDetails.getId(), pageable));
    }

    @GetMapping("/requests")
    public ResponseEntity<Page<FriendRequestResponse>> getPendingRequests(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(friendService.getPendingRequests(userDetails.getId(), pageable));
    }

    @PostMapping("/requests")
    public ResponseEntity<FriendRequestActionResponse> sendFriendRequest(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody SendFriendRequestRequest request) {
        return ResponseEntity.status(201)
                .body(friendService.sendFriendRequest(userDetails.getId(), request));
    }

    @PatchMapping("/requests/{requestId}")
    public ResponseEntity<FriendRequestActionResponse> respondToRequest(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID requestId,
            @Valid @RequestBody RespondToFriendRequestRequest request) {
        return ResponseEntity.ok(
                friendService.respondToRequest(requestId, userDetails.getId(), request));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeFriend(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID userId) {
        friendService.removeFriend(userDetails.getId(), userId);
        return ResponseEntity.noContent().build();
    }
}
