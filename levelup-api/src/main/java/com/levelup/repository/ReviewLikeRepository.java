package com.levelup.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.levelup.model.ReviewLike;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, UUID>{
    boolean existsByUserIdAndReviewId(UUID userId, UUID reviewId);

    Optional<ReviewLike> findByUserIdAndReviewId(UUID userId, UUID reviewId);
}
