package com.levelup.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.levelup.dto.request.UpdateProfileRequest;
import com.levelup.dto.response.UserResponse;
import com.levelup.dto.response.UserSummaryResponse;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.User;
import com.levelup.model.enums.LibraryStatus;
import com.levelup.repository.LibraryEntryRepository;
import com.levelup.repository.ReviewRepository;
import com.levelup.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final LibraryEntryRepository libraryEntryRepository;
    private final ReviewRepository reviewRepository;
    private final FriendService friendService;

    public UserResponse getMe(UUID userId){
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));
        long libraryTotalCount = libraryEntryRepository.countByUserId(userId);
        long completeTotalCount = libraryEntryRepository.countByUserIdAndStatus(userId, LibraryStatus.COMPLETED);
        long reviewCount = reviewRepository.countByUserId(userId);
        return UserResponse.from(user, libraryTotalCount, completeTotalCount, reviewCount);
    }

    public UserResponse getByUsername(String username, UUID currentUserId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));
        long libraryTotalCount = libraryEntryRepository.countByUserId(user.getId());
        long libraryCompleteTotalCount = libraryEntryRepository.countByUserIdAndStatus(user.getId(), LibraryStatus.COMPLETED);
        long reviewCount = reviewRepository.countByUserId(user.getId());

        if (currentUserId == null || currentUserId.equals(user.getId())) {
            return UserResponse.from(user, libraryTotalCount, libraryCompleteTotalCount, reviewCount);
        }
        boolean isFriend = friendService.areUsersFriends(currentUserId, user.getId());
        String requestStatus = isFriend ? null : friendService.getRequestStatus(currentUserId, user.getId());
        return UserResponse.from(user, libraryTotalCount, libraryCompleteTotalCount, reviewCount, isFriend, requestStatus);
    }

    public Page<UserSummaryResponse> searchUsers(String query, UUID currentUserId, Pageable pageable) {
        return userRepository.findByUsernameContainingIgnoreCase(query, pageable)
                .map(user -> {
                    if (user.getId().equals(currentUserId)) {
                        return UserSummaryResponse.from(user, false, null);
                    }
                    boolean isFriend = friendService.areUsersFriends(currentUserId, user.getId());
                    String requestStatus = isFriend ? null : friendService.getRequestStatus(currentUserId, user.getId());
                    return UserSummaryResponse.from(user, isFriend, requestStatus);
                });
    }

    public UserResponse updateProfile(UUID userId, UpdateProfileRequest updateProfileRequest){
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));
        if(updateProfileRequest.getBio() != null){
            user.setBio(updateProfileRequest.getBio());
        }
        if(updateProfileRequest.getAvatarUrl() != null){
            user.setAvatarUrl(updateProfileRequest.getAvatarUrl());
        }
        User saved = userRepository.save(user);
        long libraryCount = libraryEntryRepository.countByUserId(userId);
        long completedCount = libraryEntryRepository.countByUserIdAndStatus(userId, LibraryStatus.COMPLETED);
        long reviewCount = reviewRepository.countByUserId(userId);
        return UserResponse.from(saved, libraryCount, completedCount, reviewCount);
    }
}
