package com.levelup.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Entity
@Table(name = "genres")
@Getter
@Setter
@NoArgsConstructor
public class Genre {
    @Id
    private Integer id;
    @Column(nullable = false, unique = true)
    private String name;
    @Column(nullable =false, unique = true)
    private String slug;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    private void prePersist(){
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
    @PreUpdate
    private void preUpdate(){
        updatedAt = Instant.now();
    }
}
