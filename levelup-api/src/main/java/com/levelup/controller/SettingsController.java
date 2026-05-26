package com.levelup.controller;

import com.levelup.dto.request.DeleteAccountRequest;
import com.levelup.dto.request.PrivacySettingsRequest;
import com.levelup.dto.request.UpdateAccountSettingsRequest;
import com.levelup.dto.response.MessageResponse;
import com.levelup.dto.response.UserResponse;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

  private final SettingsService settingsService;

  @PatchMapping("/account")
  public ResponseEntity<UserResponse> updateAccountSettings(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @RequestBody UpdateAccountSettingsRequest request) {
    return ResponseEntity.ok(settingsService.updateAccountSettings(userDetails.getId(), request));
  }

  @PatchMapping("/privacy")
  public ResponseEntity<UserResponse> updatePrivacySettings(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @RequestBody PrivacySettingsRequest request) {
    return ResponseEntity.ok(settingsService.updatePrivacySettings(userDetails.getId(), request));
  }

  @DeleteMapping("/account")
  public ResponseEntity<MessageResponse> deleteAccount(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @RequestBody DeleteAccountRequest request) {
    settingsService.softDeleteAccount(userDetails.getId(), request);
    return ResponseEntity.ok(
        new MessageResponse(
            "Account scheduled for deletion. You have 30 days to recover it by contacting support."));
  }
}
