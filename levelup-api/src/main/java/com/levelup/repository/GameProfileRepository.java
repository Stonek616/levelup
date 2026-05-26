package com.levelup.repository;

import com.levelup.model.GameProfile;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameProfileRepository extends JpaRepository<GameProfile, UUID> {
  List<GameProfile> findByUserId(UUID userId);

  boolean existsByUserIdAndPlatform(UUID userId, String platform);
}
