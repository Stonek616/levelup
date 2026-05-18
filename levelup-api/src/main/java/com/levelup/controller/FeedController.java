package com.levelup.controller;

import com.levelup.dto.response.FeedEventResponse;
import com.levelup.dto.response.TrendingGameResponse;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.FeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    @GetMapping("/api/v1/feed")
    public ResponseEntity<Page<FeedEventResponse>> getFriendsFeed(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(feedService.getFriendsFeed(userDetails.getId(), pageable));
    }

    @GetMapping("/api/v1/discover/trending")
    public ResponseEntity<Page<TrendingGameResponse>> getTrending(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(feedService.getTrending(pageable));
    }
}
