package com.levelup.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.levelup.model.CommentLike;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, UUID> {
    boolean existsByUserIdAndCommentId(UUID userId, UUID commentId);

    Optional<CommentLike> findByUserIdAndCommentId(UUID userId, UUID commentId);
}
