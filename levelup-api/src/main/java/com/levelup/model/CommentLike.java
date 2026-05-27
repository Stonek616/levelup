package com.levelup.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "comment_likes")
@Getter
@Setter
@NoArgsConstructor
public class CommentLike {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "review_comment_id", nullable = false)
  private ReviewComment comment;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @PrePersist
  void prePersist() {
    createdAt = Instant.now();
  }
}
