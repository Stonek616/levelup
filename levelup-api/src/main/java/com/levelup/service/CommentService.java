package com.levelup.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.levelup.dto.request.CreateCommentRequest;
import com.levelup.dto.response.CommentResponse;
import com.levelup.dto.response.LikeResponse;
import com.levelup.exception.ForbiddenException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.CommentLike;
import com.levelup.model.Review;
import com.levelup.model.ReviewComment;
import com.levelup.model.User;
import com.levelup.model.enums.FeedEventType;
import com.levelup.repository.CommentLikeRepository;
import com.levelup.repository.ReviewCommentRepository;
import com.levelup.repository.ReviewRepository;
import com.levelup.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final ReviewCommentRepository reviewCommentRepository;
    private final ReviewRepository reviewRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final UserRepository userRepository;
    private final FeedService feedService;

    @Transactional(readOnly = true)
    public Page<CommentResponse> getComments(UUID reviewId, UUID currentUserId, Pageable pageable) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review not found");
        }
        return reviewCommentRepository.findByReviewId(reviewId, pageable)
                .map(comment -> buildResponse(comment, currentUserId));
    }

    public CommentResponse addComment(UUID reviewId, UUID userId, CreateCommentRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        User user = userRepository.getReferenceById(userId);

        ReviewComment comment = new ReviewComment();
        comment.setReview(review);
        comment.setUser(user);
        comment.setBody(request.getBody());
        comment.setLikeCount(0);

        ReviewComment saved = reviewCommentRepository.save(comment);
        feedService.emitFeedEvent(userId, review.getGame().getId(), FeedEventType.COMMENT_POSTED, null);
        return buildResponse(saved, userId);
    }

    public void deleteComment(UUID commentId, UUID userId) {
        ReviewComment comment = reviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You do not own this comment");
        }
        reviewCommentRepository.delete(comment);
    }

    public LikeResponse likeComment(UUID commentId, UUID userId) {
        ReviewComment comment = reviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        boolean alreadyLiked = commentLikeRepository.existsByUserIdAndCommentId(userId, commentId);
        if (!alreadyLiked) {
            CommentLike like = new CommentLike();
            like.setComment(comment);
            like.setUser(userRepository.getReferenceById(userId));
            commentLikeRepository.save(like);
            comment.setLikeCount(comment.getLikeCount() + 1);
            reviewCommentRepository.save(comment);
        }

        return new LikeResponse(comment.getLikeCount(), true);
    }

    public LikeResponse unlikeComment(UUID commentId, UUID userId) {
        ReviewComment comment = reviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        commentLikeRepository.findByUserIdAndCommentId(userId, commentId).ifPresent(like -> {
            commentLikeRepository.delete(like);
            comment.setLikeCount(Math.max(0, comment.getLikeCount() - 1));
            reviewCommentRepository.save(comment);
        });

        return new LikeResponse(comment.getLikeCount(), false);
    }

    private CommentResponse buildResponse(ReviewComment comment, UUID currentUserId) {
        boolean likedByMe = currentUserId != null &&
                commentLikeRepository.existsByUserIdAndCommentId(currentUserId, comment.getId());
        return CommentResponse.from(comment, likedByMe);
    }
}
