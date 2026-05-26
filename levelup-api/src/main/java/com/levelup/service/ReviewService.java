package com.levelup.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.levelup.dto.request.CreateReviewRequest;
import com.levelup.dto.request.UpdateReviewRequest;
import com.levelup.dto.response.LikeResponse;
import com.levelup.dto.response.ReviewResponse;
import com.levelup.exception.ConflictException;
import com.levelup.exception.ForbiddenException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.Game;
import com.levelup.model.Review;
import com.levelup.model.ReviewLike;
import com.levelup.model.User;
import com.levelup.model.enums.FeedEventType;
import com.levelup.repository.GameRepository;
import com.levelup.repository.LibraryEntryRepository;
import com.levelup.repository.ReviewCommentRepository;
import com.levelup.repository.ReviewLikeRepository;
import com.levelup.repository.ReviewRepository;
import com.levelup.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    private static final String reviewNotFound = "Review not Found";

    private final ReviewRepository reviewRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final LibraryEntryRepository libraryEntryRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final FeedService feedService;

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsForGame(UUID gameId, UUID currentUserId, Pageable pageable) {
        return reviewRepository.findByGameId(gameId, pageable)
                .map(review -> buildResponse(review, currentUserId));
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReview(UUID reviewId, UUID currentUserId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException(reviewNotFound));
        return buildResponse(review, currentUserId);
    }

    public ReviewResponse createReview(UUID gameId, UUID userId, CreateReviewRequest request) {
        if (!libraryEntryRepository.existsByUserIdAndGameId(userId, gameId)) {
            throw new ForbiddenException("You must have this game in your library to review it");
        }
        if (reviewRepository.existsByUserIdAndGameId(userId, gameId)) {
            throw new ConflictException("You have already reviewed this game");
        }

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));
        User user = userRepository.getReferenceById(userId);

        Review review = new Review();
        review.setUser(user);
        review.setGame(game);
        review.setBody(request.getBody());
        review.setLikeCount(0);

        Review saved = reviewRepository.save(review);
        feedService.emitFeedEvent(userId, game.getId(), FeedEventType.REVIEW_POSTED, null);
        return buildResponse(saved, userId);
    }

    public ReviewResponse updateReview(UUID reviewId, UUID userId, UpdateReviewRequest request) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new ForbiddenException("Review not found or you do not own it"));

        if (request.getBody() != null) {
            review.setBody(request.getBody());
        }
        if (request.getRating() != null) {
            libraryEntryRepository.findByUserIdAndGameId(userId, review.getGame().getId())
                    .ifPresent(entry -> {
                        entry.setRating(request.getRating());
                        libraryEntryRepository.save(entry);
                    });
        }

        Review saved = reviewRepository.save(review);
        return buildResponse(saved, userId);
    }

    public void deleteReview(UUID reviewId, UUID userId) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new ForbiddenException("Review not found or you do not own it"));
        reviewRepository.delete(review);
    }

    public LikeResponse likeReview(UUID reviewId, UUID userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException(reviewNotFound));

        boolean alreadyLiked = reviewLikeRepository.existsByUserIdAndReviewId(userId, reviewId);
        if (!alreadyLiked) {
            ReviewLike like = new ReviewLike();
            like.setReview(review);
            like.setUser(userRepository.getReferenceById(userId));
            reviewLikeRepository.save(like);
            review.setLikeCount(review.getLikeCount() + 1);
            reviewRepository.save(review);
        }

        return new LikeResponse(review.getLikeCount(), true);
    }

    public LikeResponse unlikeReview(UUID reviewId, UUID userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        reviewLikeRepository.findByUserIdAndReviewId(userId, reviewId).ifPresent(like -> {
            reviewLikeRepository.delete(like);
            review.setLikeCount(Math.max(0, review.getLikeCount() - 1));
            reviewRepository.save(review);
        });

        return new LikeResponse(review.getLikeCount(), false);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByUser(String username, UUID currentUserId, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        // TODO Phase 12: enforce reviewsVisibility privacy setting
        return reviewRepository.findByUserId(user.getId(), pageable)
                .map(review -> buildResponse(review, currentUserId));
    }

    private ReviewResponse buildResponse(Review review, UUID currentUserId) {
        Integer rating = libraryEntryRepository
                .findByUserIdAndGameId(review.getUser().getId(), review.getGame().getId())
                .map(entry -> entry.getRating())
                .orElse(null);

        long commentCount = reviewCommentRepository.countByReviewId(review.getId());

        boolean likedByMe = currentUserId != null &&
                reviewLikeRepository.existsByUserIdAndReviewId(currentUserId, review.getId());

        return ReviewResponse.from(review, rating, commentCount, likedByMe);
    }
}
