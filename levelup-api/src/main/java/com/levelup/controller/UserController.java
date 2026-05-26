package com.levelup.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.levelup.dto.request.CreateGameProfileRequest;
import com.levelup.dto.request.OnboardingRequest;
import com.levelup.dto.request.UpdateProfileRequest;
import com.levelup.dto.response.FeedEventResponse;
import com.levelup.dto.response.GameProfileResponse;
import com.levelup.dto.response.LibraryEntryResponse;
import com.levelup.dto.response.MessageResponse;
import com.levelup.dto.response.TasteProfileResponse;
import com.levelup.dto.response.UserResponse;
import com.levelup.dto.response.UserSummaryResponse;
import com.levelup.model.enums.LibraryStatus;
import com.levelup.model.enums.OwnershipStatus;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.FeedService;
import com.levelup.service.LibraryService;
import com.levelup.service.TasteProfileService;
import com.levelup.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final TasteProfileService tasteProfileService;
    private final FeedService feedService;
    private final LibraryService libraryService;

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

    @PostMapping("/me/onboarding")
    public ResponseEntity<MessageResponse> completeOnboarding(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody OnboardingRequest request) {
        userService.completeOnboarding(userDetails.getId(), request);
        return ResponseEntity.ok(new MessageResponse("Onboarding complete."));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> uploadAvatar(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.uploadAvatar(userDetails.getId(), file));
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<UserResponse> deleteAvatar(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.deleteAvatar(userDetails.getId()));
    }

    @GetMapping("/me/game-profiles")
    public ResponseEntity<List<GameProfileResponse>> getGameProfiles(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getGameProfiles(userDetails.getId()));
    }

    @PostMapping("/me/game-profiles")
    public ResponseEntity<GameProfileResponse> addGameProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CreateGameProfileRequest request) {
        return ResponseEntity.ok(userService.addGameProfile(userDetails.getId(), request));
    }

    @DeleteMapping("/me/game-profiles/{profileId}")
    public ResponseEntity<Void> removeGameProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID profileId) {
        userService.removeGameProfile(userDetails.getId(), profileId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{username}/library")
    public ResponseEntity<Page<LibraryEntryResponse>> getUserLibrary(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) LibraryStatus status,
            @RequestParam(required = false) OwnershipStatus ownership,
            @RequestParam(required = false) String platform,
            Pageable pageable) {
        UUID currentUserId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(libraryService.getUserLibraryForViewer(username, currentUserId, status, ownership, platform, pageable));
    }

    @GetMapping("/{username}/game-profiles")
    public ResponseEntity<List<GameProfileResponse>> getGameProfilesForUser(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        UUID currentUserId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(userService.getGameProfilesForUser(username, currentUserId));
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

    @GetMapping("/{username}/activity")
    public ResponseEntity<Page<FeedEventResponse>> getUserActivity(
            @PathVariable String username,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(feedService.getUserActivity(username, pageable));
    }
}
