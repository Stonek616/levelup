package com.levelup.repository;

import com.levelup.model.FriendRequest;
import com.levelup.model.enums.FriendshipStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {

  Optional<FriendRequest> findByRequesterIdAndReceiverId(UUID requesterId, UUID receiverId);

  boolean existsByRequesterIdAndReceiverId(UUID requesterId, UUID receiverId);

  Page<FriendRequest> findByReceiverIdAndStatus(
      UUID receiverId, FriendshipStatus status, Pageable pageable);
}
