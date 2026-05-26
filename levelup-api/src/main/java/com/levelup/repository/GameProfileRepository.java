package com.levelup.repository;

import com.levelup.model.GameProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GameProfileRepository extends JpaRepository<GameProfile, UUID> {
    List<GameProfile> findByUserId(UUID userId);
    boolean existsByUserIdAndPlatform(UUID userId, String platform);
}
