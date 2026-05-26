package com.levelup.repository;

import com.levelup.model.ReviewLike;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, UUID> {
  boolean existsByUserIdAndReviewId(UUID userId, UUID reviewId);

  Optional<ReviewLike> findByUserIdAndReviewId(UUID userId, UUID reviewId);
}
