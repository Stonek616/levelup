package com.levelup.repository;

import com.levelup.model.DailyChallengeResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailyChallengeResultRepository extends JpaRepository<DailyChallengeResult, UUID> {

    Optional<DailyChallengeResult> findByUserIdAndChallengeId(UUID userId, UUID challengeId);

    List<DailyChallengeResult> findByUserIdOrderByCompletedAtDesc(UUID userId);

    @Query("SELECT r FROM DailyChallengeResult r JOIN FETCH r.user WHERE r.challenge.id = :challengeId AND r.user.id IN :friendIds ORDER BY r.completedAt ASC")
    List<DailyChallengeResult> findFriendScores(@Param("challengeId") UUID challengeId, @Param("friendIds") List<UUID> friendIds);

    @Query("SELECT r FROM DailyChallengeResult r JOIN FETCH r.challenge WHERE r.user.id = :userId ORDER BY r.completedAt DESC")
    Page<DailyChallengeResult> findByUserIdPaged(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM DailyChallengeResult r WHERE r.challenge.id = :challengeId AND r.user.id IN :friendIds")
    int countFriendCompletions(@Param("challengeId") UUID challengeId, @Param("friendIds") List<UUID> friendIds);
}
