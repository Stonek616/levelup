package com.levelup.dto.response;

import com.levelup.model.FeedEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedEventResponse {

    private UUID id;
    private String type;
    private UserInFeed user;
    private GameInFeed game;
    private String metadata;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInFeed {
        private UUID id;
        private String username;
        private String avatarUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameInFeed {
        private UUID id;
        private String title;
        private String coverImageId;
    }

    public static FeedEventResponse from(FeedEvent event) {
        return FeedEventResponse.builder()
                .id(event.getId())
                .type(event.getEventType().name())
                .user(UserInFeed.builder()
                        .id(event.getUser().getId())
                        .username(event.getUser().getUsername())
                        .avatarUrl(event.getUser().getAvatarUrl())
                        .build())
                .game(GameInFeed.builder()
                        .id(event.getGame().getId())
                        .title(event.getGame().getTitle())
                        .coverImageId(event.getGame().getCoverImageId())
                        .build())
                .metadata(event.getMetadata())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
