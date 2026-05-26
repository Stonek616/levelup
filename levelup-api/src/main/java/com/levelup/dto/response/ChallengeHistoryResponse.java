package com.levelup.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeHistoryResponse {
    private int currentStreak;
    private int longestStreak;
    private int totalCompleted;
    private Page<ChallengeHistoryEntryResponse> history;
}
