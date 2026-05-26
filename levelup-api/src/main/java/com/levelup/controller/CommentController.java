package com.levelup.controller;

import com.levelup.dto.request.CreateCommentRequest;
import com.levelup.dto.response.CommentResponse;
import com.levelup.dto.response.LikeResponse;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.CommentService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CommentController {

  private final CommentService commentService;

  @GetMapping("/reviews/{reviewId}/comments")
  public ResponseEntity<Page<CommentResponse>> getComments(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @PathVariable UUID reviewId,
      Pageable pageable) {
    UUID currentUserId = userDetails != null ? userDetails.getId() : null;
    return ResponseEntity.ok(commentService.getComments(reviewId, currentUserId, pageable));
  }

  @PostMapping("/reviews/{reviewId}/comments")
  public ResponseEntity<CommentResponse> addComment(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @PathVariable UUID reviewId,
      @Valid @RequestBody CreateCommentRequest request) {
    CommentResponse comment = commentService.addComment(reviewId, userDetails.getId(), request);
    return ResponseEntity.status(HttpStatus.CREATED).body(comment);
  }

  @DeleteMapping("/comments/{commentId}")
  public ResponseEntity<Void> deleteComment(
      @AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable UUID commentId) {
    commentService.deleteComment(commentId, userDetails.getId());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/comments/{commentId}/like")
  public ResponseEntity<LikeResponse> likeComment(
      @AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable UUID commentId) {
    return ResponseEntity.ok(commentService.likeComment(commentId, userDetails.getId()));
  }

  @DeleteMapping("/comments/{commentId}/like")
  public ResponseEntity<LikeResponse> unlikeComment(
      @AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable UUID commentId) {
    return ResponseEntity.ok(commentService.unlikeComment(commentId, userDetails.getId()));
  }
}
