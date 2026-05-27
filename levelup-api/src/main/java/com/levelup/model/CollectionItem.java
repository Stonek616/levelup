package com.levelup.model;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "collection_items")
@IdClass(CollectionItemId.class)
@Getter
@Setter
@NoArgsConstructor
public class CollectionItem {

  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "collection_id", nullable = false)
  private Collection collection;

  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "game_id", nullable = false)
  private Game game;

  @Column(name = "added_at", nullable = false, updatable = false)
  private Instant addedAt;

  @PrePersist
  void prePersist() {
    addedAt = Instant.now();
  }
}
