package com.levelup.model;

import com.levelup.model.enums.UserRole;
import com.levelup.model.enums.VisibilityType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, unique = true, length = 50)
  private String username;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(columnDefinition = "TEXT")
  private String bio;

  @Column(name = "avatar_url")
  private String avatarUrl;

  @Column(name = "onboarding_completed", nullable = false)
  private boolean onboardingCompleted = false;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserRole role = UserRole.USER;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private VisibilityType libraryVisibility = VisibilityType.PUBLIC;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private VisibilityType wishlistVisibility = VisibilityType.PUBLIC;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private VisibilityType reviewsVisibility = VisibilityType.PUBLIC;

  private LocalDateTime deletedAt;

  @PrePersist
  void prePersist() {
    createdAt = Instant.now();
    updatedAt = Instant.now();
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }
}
