package com.levelup.service;

import com.levelup.dto.request.DeleteAccountRequest;
import com.levelup.dto.request.PrivacySettingsRequest;
import com.levelup.dto.request.UpdateAccountSettingsRequest;
import com.levelup.dto.response.UserResponse;
import com.levelup.exception.ConflictException;
import com.levelup.exception.ForbiddenException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.User;
import com.levelup.model.enums.LibraryStatus;
import com.levelup.repository.LibraryEntryRepository;
import com.levelup.repository.ReviewRepository;
import com.levelup.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SettingsService {

    private final UserRepository userRepository;
    private final LibraryEntryRepository libraryEntryRepository;
    private final ReviewRepository reviewRepository;
    private final FriendService friendService;
    private final PasswordEncoder passwordEncoder;

    public UserResponse updateAccountSettings(UUID userId, UpdateAccountSettingsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new ConflictException("Username is already taken");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ConflictException("Email is already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getNewPassword() != null) {
            if (request.getCurrentPassword() == null
                    || !passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                throw new ForbiddenException("Current password is incorrect");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        User saved = userRepository.save(user);
        return buildUserResponse(saved, userId);
    }

    public UserResponse updatePrivacySettings(UUID userId, PrivacySettingsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getLibraryVisibility() != null) {
            user.setLibraryVisibility(request.getLibraryVisibility());
        }
        if (request.getWishlistVisibility() != null) {
            user.setWishlistVisibility(request.getWishlistVisibility());
        }
        if (request.getReviewsVisibility() != null) {
            user.setReviewsVisibility(request.getReviewsVisibility());
        }

        User saved = userRepository.save(user);
        return buildUserResponse(saved, userId);
    }

    public void softDeleteAccount(UUID userId, DeleteAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ForbiddenException("Password is incorrect");
        }

        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private UserResponse buildUserResponse(User user, UUID userId) {
        long libraryCount = libraryEntryRepository.countByUserId(userId);
        long completedCount = libraryEntryRepository.countByUserIdAndStatus(userId, LibraryStatus.COMPLETED);
        long reviewCount = reviewRepository.countByUserId(userId);
        long friendCount = friendService.getFriendCount(userId);
        return UserResponse.from(user, libraryCount, completedCount, reviewCount, friendCount);
    }
}
