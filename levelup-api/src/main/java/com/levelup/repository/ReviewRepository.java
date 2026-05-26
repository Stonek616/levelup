package com.levelup.repository;

import com.levelup.model.Review;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
  Page<Review> findByGameId(UUID gameId, Pageable pageable);

  Page<Review> findByUserId(UUID userId, Pageable pageable);

  boolean existsByUserIdAndGameId(UUID userId, UUID gameId);

  Optional<Review> findByIdAndUserId(UUID id, UUID userId);

  long countByUserId(UUID userId);
}
