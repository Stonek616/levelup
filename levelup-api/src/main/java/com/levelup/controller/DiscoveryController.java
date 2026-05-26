package com.levelup.controller;

import com.levelup.dto.response.DiscoveryGameResponse;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.DiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/discover")
@RequiredArgsConstructor
public class DiscoveryController {

  private final DiscoveryService discoveryService;

  @GetMapping("/for-you")
  public ResponseEntity<Page<DiscoveryGameResponse>> getForYou(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(discoveryService.getForYou(userDetails.getId(), pageable));
  }

  @GetMapping("/similar")
  public ResponseEntity<Page<DiscoveryGameResponse>> getSimilar(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(discoveryService.getSimilar(userDetails.getId(), pageable));
  }

  @GetMapping("/new")
  public ResponseEntity<Page<DiscoveryGameResponse>> getNewAndNotable(
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(discoveryService.getNewAndNotable(pageable));
  }
}
