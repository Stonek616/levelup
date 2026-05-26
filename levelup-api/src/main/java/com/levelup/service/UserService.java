package com.levelup.service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.levelup.dto.request.CreateGameProfileRequest;
import com.levelup.dto.request.OnboardingRequest;
import com.levelup.dto.request.UpdateProfileRequest;
import com.levelup.dto.response.GameProfileResponse;
import com.levelup.dto.response.UserResponse;
import com.levelup.dto.response.UserSummaryResponse;
import com.levelup.exception.ConflictException;
import com.levelup.exception.ForbiddenException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.GameProfile;
import com.levelup.model.LibraryEntry;
import com.levelup.model.User;
import com.levelup.model.enums.LibraryStatus;
import com.levelup.model.enums.OwnershipStatus;
import com.levelup.repository.GameProfileRepository;
import com.levelup.repository.GameRepository;
import com.levelup.repository.LibraryEntryRepository;
import com.levelup.repository.ReviewRepository;
import com.levelup.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final LibraryEntryRepository libraryEntryRepository;
    private final ReviewRepository reviewRepository;
    private final FriendService friendService;
    private final GameRepository gameRepository;
    private final GameProfileRepository gameProfileRepository;
    private final CloudinaryService cloudinaryService;

    public UserResponse getMe(UUID userId){
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));
        long libraryTotalCount = libraryEntryRepository.countByUserId(userId);
        long completeTotalCount = libraryEntryRepository.countByUserIdAndStatus(userId, LibraryStatus.COMPLETED);
        long reviewCount = reviewRepository.countByUserId(userId);
        long friendCount = friendService.getFriendCount(userId);
        return UserResponse.from(user, libraryTotalCount, completeTotalCount, reviewCount, friendCount);
    }

    public UserResponse getByUsername(String username, UUID currentUserId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));
        long libraryTotalCount = libraryEntryRepository.countByUserId(user.getId());
        long libraryCompleteTotalCount = libraryEntryRepository.countByUserIdAndStatus(user.getId(), LibraryStatus.COMPLETED);
        long reviewCount = reviewRepository.countByUserId(user.getId());
        long friendCount = friendService.getFriendCount(user.getId());

        if (currentUserId == null || currentUserId.equals(user.getId())) {
            return UserResponse.from(user, libraryTotalCount, libraryCompleteTotalCount, reviewCount, friendCount);
        }
        boolean isFriend = friendService.areUsersFriends(currentUserId, user.getId());
        String requestStatus = isFriend ? null : friendService.getRequestStatus(currentUserId, user.getId());
        return UserResponse.from(user, libraryTotalCount, libraryCompleteTotalCount, reviewCount, friendCount, isFriend, requestStatus);
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

    @Transactional
    public UserResponse uploadAvatar(UUID userId, MultipartFile file) {
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File too large — max 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are accepted");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));
        try {
            String url = cloudinaryService.uploadAvatar(userId, file.getBytes());
            user.setAvatarUrl(url);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed");
        }
        User saved = userRepository.save(user);
        long libraryCount = libraryEntryRepository.countByUserId(userId);
        long completedCount = libraryEntryRepository.countByUserIdAndStatus(userId, LibraryStatus.COMPLETED);
        long reviewCount = reviewRepository.countByUserId(userId);
        long friendCount = friendService.getFriendCount(userId);
        return UserResponse.from(saved, libraryCount, completedCount, reviewCount, friendCount);
    }

    @Transactional
    public UserResponse deleteAvatar(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));
        if (user.getAvatarUrl() != null) {
            try {
                cloudinaryService.deleteAvatar(userId);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Delete failed");
            }
            user.setAvatarUrl(null);
            userRepository.save(user);
        }
        long libraryCount = libraryEntryRepository.countByUserId(userId);
        long completedCount = libraryEntryRepository.countByUserIdAndStatus(userId, LibraryStatus.COMPLETED);
        long reviewCount = reviewRepository.countByUserId(userId);
        long friendCount = friendService.getFriendCount(userId);
        return UserResponse.from(user, libraryCount, completedCount, reviewCount, friendCount);
    }

    @Transactional
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
        long friendCount = friendService.getFriendCount(userId);
        return UserResponse.from(saved, libraryCount, completedCount, reviewCount, friendCount);
    }

    @Transactional
    public void completeOnboarding(UUID userId, OnboardingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isOnboardingCompleted()) {
            throw new ConflictException("Onboarding already completed");
        }

        if (request.getSeededGameIds() != null) {
            for (UUID gameId : request.getSeededGameIds()) {
                if (libraryEntryRepository.existsByUserIdAndGameId(userId, gameId)) continue;
                gameRepository.findById(gameId).ifPresent(game -> {
                    LibraryEntry entry = new LibraryEntry();
                    entry.setUser(userRepository.getReferenceById(userId));
                    entry.setGame(game);
                    entry.setOwnership(OwnershipStatus.NONE);
                    entry.setStatus(LibraryStatus.PLAYED);
                    entry.setPlatforms(new String[0]);
                    libraryEntryRepository.save(entry);
                });
            }
        }

        user.setOnboardingCompleted(true);
        userRepository.save(user);
    }

    public List<GameProfileResponse> getGameProfiles(UUID userId) {
        return gameProfileRepository.findByUserId(userId).stream()
                .map(GameProfileResponse::from)
                .toList();
    }

    public List<GameProfileResponse> getGameProfilesForUser(String username, UUID currentUserId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean isOwn = currentUserId != null && currentUserId.equals(user.getId());
        boolean isFriend = !isOwn && currentUserId != null && friendService.areUsersFriends(currentUserId, user.getId());
        if (!isOwn && !isFriend) {
            throw new ForbiddenException("Gaming profiles are only visible to friends");
        }
        return gameProfileRepository.findByUserId(user.getId()).stream()
                .map(GameProfileResponse::from)
                .toList();
    }

    @Transactional
    public GameProfileResponse addGameProfile(UUID userId, CreateGameProfileRequest request) {
        if (gameProfileRepository.existsByUserIdAndPlatform(userId, request.getPlatform())) {
            throw new ConflictException("A profile for " + request.getPlatform() + " is already linked");
        }
        GameProfile profile = new GameProfile();
        profile.setUser(userRepository.getReferenceById(userId));
        profile.setPlatform(request.getPlatform());
        profile.setHandle(request.getHandle());
        return GameProfileResponse.from(gameProfileRepository.save(profile));
    }

    @Transactional
    public void removeGameProfile(UUID userId, UUID profileId) {
        GameProfile profile = gameProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Game profile not found"));
        if (!profile.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You do not own this game profile");
        }
        gameProfileRepository.delete(profile);
    }
}
