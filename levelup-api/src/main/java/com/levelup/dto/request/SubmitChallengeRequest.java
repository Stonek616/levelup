package com.levelup.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SubmitChallengeRequest {
    private Answer answer;

    @Data
    public static class Answer {
        // 0-indexed position of the odd-one-out game in each round's shuffled list
        private List<Integer> roundAnswers;
    }
}
