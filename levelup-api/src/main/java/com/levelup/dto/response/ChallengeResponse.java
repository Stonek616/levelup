package com.levelup.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChallengeResponse {
    private String id;
    private LocalDate challengeDate;
    private String challengeType;
    private boolean completed;

    // Present when NOT yet completed
    private Map<String, Object> payload;
    private Integer friendCompletedCount;

    // Present when already completed
    private ChallengeResultResponse result;
    private List<FriendChallengeScoreResponse> friendScores;
}
