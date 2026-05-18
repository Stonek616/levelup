package com.levelup.repository;

import com.levelup.model.Friendship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    Page<Friendship> findByUserId(UUID userId, Pageable pageable);

    boolean existsByUserIdAndFriendId(UUID userId, UUID friendId);

    Optional<Friendship> findByUserIdAndFriendId(UUID userId, UUID friendId);

    // Returns only the friend UUIDs — used by FeedService to avoid loading full entities
    @Query("SELECT f.friend.id FROM Friendship f WHERE f.user.id = :userId")
    List<UUID> findFriendIdsByUserId(@Param("userId") UUID userId);
}
