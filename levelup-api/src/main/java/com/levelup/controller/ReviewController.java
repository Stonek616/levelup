package com.levelup.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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

import com.levelup.dto.request.CreateReviewRequest;
import com.levelup.dto.request.UpdateReviewRequest;
import com.levelup.dto.response.LikeResponse;
import com.levelup.dto.response.ReviewResponse;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/games/{gameId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviewsForGame(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID gameId,
            Pageable pageable) {
        UUID currentUserId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(reviewService.getReviewsForGame(gameId, currentUserId, pageable));
    }

    @PostMapping("/games/{gameId}/reviews")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID gameId,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse review = reviewService.createReview(gameId, userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewResponse> getReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID reviewId) {
        UUID currentUserId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(reviewService.getReview(reviewId, currentUserId));
    }

    @PatchMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID reviewId,
            @Valid @RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, userDetails.getId(), request));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID reviewId) {
        reviewService.deleteReview(reviewId, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reviews/{reviewId}/like")
    public ResponseEntity<LikeResponse> likeReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID reviewId) {
        return ResponseEntity.ok(reviewService.likeReview(reviewId, userDetails.getId()));
    }

    @DeleteMapping("/reviews/{reviewId}/like")
    public ResponseEntity<LikeResponse> unlikeReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID reviewId) {
        return ResponseEntity.ok(reviewService.unlikeReview(reviewId, userDetails.getId()));
    }

    @GetMapping("/users/{username}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByUser(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String username,
            Pageable pageable) {
        UUID currentUserId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(reviewService.getReviewsByUser(username, currentUserId, pageable));
    }
}
