package com.levelup.dto.response;

import com.levelup.model.Collection;
import com.levelup.model.CollectionItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionResponse {

    private UUID id;
    private String name;
    private String description;
    private String visibility;
    private UUID ownerId;
    private String ownerUsername;
    private List<GameInCollection> games;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameInCollection {
        private UUID id;
        private String title;
        private String coverImageId;
        private Instant addedAt;
    }

    public static CollectionResponse from(Collection collection, List<CollectionItem> items) {
        List<GameInCollection> games = items.stream()
                .map(item -> GameInCollection.builder()
                        .id(item.getGame().getId())
                        .title(item.getGame().getTitle())
                        .coverImageId(item.getGame().getCoverImageId())
                        .addedAt(item.getAddedAt())
                        .build())
                .toList();

        return CollectionResponse.builder()
                .id(collection.getId())
                .name(collection.getName())
                .description(collection.getDescription())
                .visibility(collection.getVisibility().name())
                .ownerId(collection.getOwner().getId())
                .ownerUsername(collection.getOwner().getUsername())
                .games(games)
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .build();
    }
}
