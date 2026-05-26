package com.levelup.controller;

import com.levelup.dto.request.WhatToPlayRequest;
import com.levelup.dto.response.WhatToPlayResponse;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.WhatToPlayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/what-to-play")
@RequiredArgsConstructor
public class WhatToPlayController {

  private final WhatToPlayService whatToPlayService;

  @PostMapping
  public ResponseEntity<WhatToPlayResponse> getSuggestions(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @RequestBody WhatToPlayRequest request) {
    return ResponseEntity.ok(whatToPlayService.getSuggestions(userDetails.getId(), request));
  }
}
