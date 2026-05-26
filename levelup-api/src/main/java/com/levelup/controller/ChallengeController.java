package com.levelup.controller;

import com.levelup.dto.request.SubmitChallengeRequest;
import com.levelup.dto.response.ChallengeHistoryResponse;
import com.levelup.dto.response.ChallengeResponse;
import com.levelup.dto.response.ChallengeResultResponse;
import com.levelup.scheduler.DailyChallengeScheduler;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.ZoneOffset;

@RestController
@RequestMapping("/api/v1/challenge")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;
    private final DailyChallengeScheduler scheduler;

    @GetMapping("/today")
    public ResponseEntity<ChallengeResponse> getToday(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(challengeService.getTodayChallenge(userDetails.getId()));
    }

    @PostMapping("/today/submit")
    public ResponseEntity<ChallengeResultResponse> submit(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody SubmitChallengeRequest request) {
        return ResponseEntity.ok(challengeService.submitResult(userDetails.getId(), request));
    }

    @GetMapping("/history")
    public ResponseEntity<ChallengeHistoryResponse> getHistory(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 30) Pageable pageable) {
        return ResponseEntity.ok(challengeService.getHistory(userDetails.getId(), pageable));
    }

    // Dev-only endpoint — manually seeds today's challenge without waiting for midnight
    @PostMapping("/admin/generate")
    public ResponseEntity<String> generateToday() {
        scheduler.generateForDate(LocalDate.now(ZoneOffset.UTC));
        return ResponseEntity.ok("Challenge generated for " + LocalDate.now(ZoneOffset.UTC));
    }
}
