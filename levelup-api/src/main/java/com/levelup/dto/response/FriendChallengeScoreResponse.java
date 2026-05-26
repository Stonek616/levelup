package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendChallengeScoreResponse {
    private String username;
    private String avatarUrl;
    private int score;
    private Instant completedAt;
}
