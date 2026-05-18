package com.levelup.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.levelup.dto.request.UpdateProfileRequest;
import com.levelup.dto.response.TasteProfileResponse;
import com.levelup.dto.response.UserResponse;
import com.levelup.dto.response.UserSummaryResponse;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.TasteProfileService;
import com.levelup.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final TasteProfileService tasteProfileService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getMe(userDetails.getId()));
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        UUID currentUserId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(userService.getByUsername(username, currentUserId));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getId(), request));
    }

    @GetMapping("/{username}/taste-profile")
    public ResponseEntity<TasteProfileResponse> getTasteProfile(
            @PathVariable String username) {
        return ResponseEntity.ok(tasteProfileService.getTasteProfile(username));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserSummaryResponse>> searchUsers(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        UUID currentUserId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(userService.searchUsers(q, currentUserId, pageable));
    }

    // Phase 12 adds: POST /me/onboarding, POST /me/avatar, DELETE /me
}
