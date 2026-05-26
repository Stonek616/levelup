package com.levelup.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.levelup.dto.request.RespondToFriendRequestRequest;
import com.levelup.dto.request.SendFriendRequestRequest;
import com.levelup.dto.response.FriendRequestActionResponse;
import com.levelup.dto.response.FriendRequestResponse;
import com.levelup.dto.response.FriendshipResponse;
import com.levelup.exception.ConflictException;
import com.levelup.exception.ForbiddenException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.FriendRequest;
import com.levelup.model.Friendship;
import com.levelup.model.enums.FriendshipStatus;
import com.levelup.repository.FriendRequestRepository;
import com.levelup.repository.FriendshipRepository;
import com.levelup.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    public FriendRequestActionResponse sendFriendRequest(UUID requesterId, SendFriendRequestRequest request) {
        UUID targetId = request.getTargetUserId();

        if (requesterId.equals(targetId)) {
            throw new ConflictException("You cannot send a friend request to yourself");
        }
        if (!userRepository.existsById(targetId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (friendshipRepository.existsByUserIdAndFriendId(requesterId, targetId)) {
            throw new ConflictException("You are already friends with this user");
        }
        if (friendRequestRepository.existsByRequesterIdAndReceiverId(requesterId, targetId)
                || friendRequestRepository.existsByRequesterIdAndReceiverId(targetId, requesterId)) {
            throw new ConflictException("A friend request already exists between these users");
        }

        FriendRequest friendRequest = new FriendRequest();
        friendRequest.setRequester(userRepository.getReferenceById(requesterId));
        friendRequest.setReceiver(userRepository.getReferenceById(targetId));

        FriendRequest saved = friendRequestRepository.save(friendRequest);
        return FriendRequestActionResponse.from(saved);
    }

    @Transactional
    public FriendRequestActionResponse respondToRequest(UUID requestId, UUID receiverId, RespondToFriendRequestRequest request) {
        FriendRequest friendRequest = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));

        if (!friendRequest.getReceiver().getId().equals(receiverId)) {
            throw new ForbiddenException("You are not the receiver of this request");
        }
        if (friendRequest.getStatus() != FriendshipStatus.PENDING) {
            throw new ConflictException("This request has already been responded to");
        }

        if ("ACCEPT".equalsIgnoreCase(request.getAction())) {
            // Extract IDs while entity is managed, before setting status
            UUID requesterId = friendRequest.getRequester().getId();
            UUID receiverUserId = friendRequest.getReceiver().getId();

            friendRequest.setStatus(FriendshipStatus.ACCEPTED);

            // Use getReferenceById to get properly-managed entity references for FK columns
            Friendship aToB = new Friendship();
            aToB.setUser(userRepository.getReferenceById(requesterId));
            aToB.setFriend(userRepository.getReferenceById(receiverUserId));

            Friendship bToA = new Friendship();
            bToA.setUser(userRepository.getReferenceById(receiverUserId));
            bToA.setFriend(userRepository.getReferenceById(requesterId));

            friendshipRepository.save(aToB);
            friendshipRepository.save(bToA);

        } else if ("DECLINE".equalsIgnoreCase(request.getAction())) {
            friendRequest.setStatus(FriendshipStatus.DECLINED);
        } else {
            throw new IllegalArgumentException("action must be ACCEPT or DECLINE");
        }

        return FriendRequestActionResponse.from(friendRequest);
    }

    @Transactional(readOnly = true)
    public Page<FriendshipResponse> getFriends(UUID userId, Pageable pageable) {
        return friendshipRepository.findByUserId(userId, pageable)
                .map(FriendshipResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<FriendRequestResponse> getPendingRequests(UUID userId, Pageable pageable) {
        return friendRequestRepository
                .findByReceiverIdAndStatus(userId, FriendshipStatus.PENDING, pageable)
                .map(FriendRequestResponse::from);
    }

    public void removeFriend(UUID userId, UUID friendUserId) {
        Friendship aToB = friendshipRepository.findByUserIdAndFriendId(userId, friendUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship not found"));
        friendshipRepository.delete(aToB);

        friendshipRepository.findByUserIdAndFriendId(friendUserId, userId)
                .ifPresent(friendshipRepository::delete);

        friendRequestRepository.findByRequesterIdAndReceiverId(userId, friendUserId)
                .or(() -> friendRequestRepository.findByRequesterIdAndReceiverId(friendUserId, userId))
                .ifPresent(friendRequestRepository::delete);
    }

    @Transactional(readOnly = true)
    public long getFriendCount(UUID userId) {
        return friendshipRepository.countByUserId(userId);
    }

    @Transactional(readOnly = true)
    public boolean areUsersFriends(UUID userId, UUID otherUserId) {
        return friendshipRepository.existsByUserIdAndFriendId(userId, otherUserId);
    }

    @Transactional(readOnly = true)
    public String getRequestStatus(UUID currentUserId, UUID targetUserId) {
        return friendRequestRepository
                .findByRequesterIdAndReceiverId(currentUserId, targetUserId)
                .or(() -> friendRequestRepository.findByRequesterIdAndReceiverId(targetUserId, currentUserId))
                .map(r -> r.getStatus().name())
                .orElse(null);
    }
}
