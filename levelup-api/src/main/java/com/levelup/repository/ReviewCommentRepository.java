package com.levelup.repository;

import com.levelup.model.ReviewComment;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, UUID> {
  Page<ReviewComment> findByReviewId(UUID reviewId, Pageable pageable);

  long countByReviewId(UUID reviewId);

  boolean existsByIdAndUserId(UUID id, UUID userId);
}
