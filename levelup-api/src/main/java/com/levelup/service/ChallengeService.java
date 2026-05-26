package com.levelup.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.levelup.dto.request.SubmitChallengeRequest;
import com.levelup.dto.response.ChallengeHistoryEntryResponse;
import com.levelup.dto.response.ChallengeHistoryResponse;
import com.levelup.dto.response.ChallengeResponse;
import com.levelup.dto.response.ChallengeResultResponse;
import com.levelup.dto.response.ChallengeRound;
import com.levelup.dto.response.ChallengeRoundGame;
import com.levelup.dto.response.FriendChallengeScoreResponse;
import com.levelup.exception.ConflictException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.model.DailyChallenge;
import com.levelup.model.DailyChallengeResult;
import com.levelup.repository.DailyChallengeRepository;
import com.levelup.repository.DailyChallengeResultRepository;
import com.levelup.repository.FriendshipRepository;
import com.levelup.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChallengeService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final DailyChallengeRepository challengeRepository;
    private final DailyChallengeResultRepository resultRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    // Stored round format (includes isOddOne — never sent to client)
    public record StoredGame(String gameId, String title, String coverUrl, boolean isOddOne) {}
    public record StoredRound(int roundNumber, String category, List<StoredGame> games) {}

    public ChallengeResponse getTodayChallenge(UUID userId) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        DailyChallenge challenge = challengeRepository.findByChallengeDate(today)
                .orElseThrow(() -> new ResourceNotFoundException("No challenge is available for today yet."));

        Optional<DailyChallengeResult> userResult =
                resultRepository.findByUserIdAndChallengeId(userId, challenge.getId());

        List<UUID> friendIds = friendshipRepository.findFriendIdsByUserId(userId);

        if (userResult.isPresent()) {
            return buildCompletedResponse(challenge, userResult.get(), friendIds);
        }

        int friendCompletedCount = friendIds.isEmpty() ? 0
                : resultRepository.countFriendCompletions(challenge.getId(), friendIds);

        List<StoredRound> storedRounds = deserializeRounds(challenge.getRounds());
        List<ChallengeRound> clientRounds = toClientRounds(storedRounds);

        return ChallengeResponse.builder()
                .id(challenge.getId().toString())
                .challengeDate(challenge.getChallengeDate())
                .challengeType(challenge.getChallengeType())
                .completed(false)
                .payload(Map.of("rounds", clientRounds))
                .friendCompletedCount(friendCompletedCount)
                .build();
    }

    @Transactional
    public ChallengeResultResponse submitResult(UUID userId, SubmitChallengeRequest request) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        DailyChallenge challenge = challengeRepository.findByChallengeDate(today)
                .orElseThrow(() -> new ResourceNotFoundException("No challenge is available today."));

        if (resultRepository.findByUserIdAndChallengeId(userId, challenge.getId()).isPresent()) {
            throw new ConflictException("You have already submitted today's challenge.");
        }

        List<StoredRound> storedRounds = deserializeRounds(challenge.getRounds());
        int score = scoreAnswers(storedRounds, request.getAnswer().getRoundAnswers());

        DailyChallengeResult result = new DailyChallengeResult();
        result.setUser(userRepository.getReferenceById(userId));
        result.setChallenge(challenge);
        result.setScore(score);
        resultRepository.save(result);

        List<UUID> friendIds = friendshipRepository.findFriendIdsByUserId(userId);
        List<FriendChallengeScoreResponse> friendScores = friendIds.isEmpty()
                ? List.of()
                : buildFriendScores(challenge.getId(), friendIds);

        long challengeNumber = challengeRepository.count();
        String shareText = "LevelUp Daily #" + challengeNumber + " — " + score + "/100";

        return ChallengeResultResponse.builder()
                .score(score)
                .shareText(shareText)
                .completedAt(result.getCompletedAt())
                .friendScores(friendScores)
                .build();
    }

    public ChallengeHistoryResponse getHistory(UUID userId, Pageable pageable) {
        Page<DailyChallengeResult> page = resultRepository.findByUserIdPaged(userId, pageable);
        List<DailyChallengeResult> all = resultRepository.findByUserIdOrderByCompletedAtDesc(userId);

        Page<ChallengeHistoryEntryResponse> historyPage = page.map(r ->
                ChallengeHistoryEntryResponse.builder()
                        .challengeDate(r.getChallenge().getChallengeDate())
                        .score(r.getScore())
                        .completedAt(r.getCompletedAt())
                        .build());

        return ChallengeHistoryResponse.builder()
                .currentStreak(calculateCurrentStreak(all))
                .longestStreak(calculateLongestStreak(all))
                .totalCompleted((int) page.getTotalElements())
                .history(historyPage)
                .build();
    }

    // --- helpers ---

    private ChallengeResponse buildCompletedResponse(DailyChallenge challenge,
                                                      DailyChallengeResult userResult,
                                                      List<UUID> friendIds) {
        List<FriendChallengeScoreResponse> friendScores = friendIds.isEmpty()
                ? List.of()
                : buildFriendScores(challenge.getId(), friendIds);

        long challengeNumber = challengeRepository.count();
        String shareText = "LevelUp Daily #" + challengeNumber + " — " + userResult.getScore() + "/100";

        ChallengeResultResponse result = ChallengeResultResponse.builder()
                .score(userResult.getScore())
                .shareText(shareText)
                .completedAt(userResult.getCompletedAt())
                .friendScores(friendScores)
                .build();

        return ChallengeResponse.builder()
                .id(challenge.getId().toString())
                .challengeDate(challenge.getChallengeDate())
                .challengeType(challenge.getChallengeType())
                .completed(true)
                .result(result)
                .friendScores(friendScores)
                .build();
    }

    private List<FriendChallengeScoreResponse> buildFriendScores(UUID challengeId, List<UUID> friendIds) {
        return resultRepository.findFriendScores(challengeId, friendIds).stream()
                .map(r -> FriendChallengeScoreResponse.builder()
                        .username(r.getUser().getUsername())
                        .avatarUrl(r.getUser().getAvatarUrl())
                        .score(r.getScore())
                        .completedAt(r.getCompletedAt())
                        .build())
                .toList();
    }

    private List<ChallengeRound> toClientRounds(List<StoredRound> storedRounds) {
        return storedRounds.stream()
                .map(sr -> ChallengeRound.builder()
                        .roundNumber(sr.roundNumber())
                        .games(sr.games().stream()
                                .map(g -> ChallengeRoundGame.builder()
                                        .gameId(g.gameId())
                                        .title(g.title())
                                        .coverUrl(g.coverUrl())
                                        .build())
                                .toList())
                        .build())
                .toList();
    }

    private int scoreAnswers(List<StoredRound> rounds, List<Integer> roundAnswers) {
        if (roundAnswers == null || roundAnswers.size() != rounds.size()) return 0;
        int score = 0;
        int pointsPerRound = 100 / rounds.size();
        for (int i = 0; i < rounds.size(); i++) {
            int answer = roundAnswers.get(i);
            List<StoredGame> games = rounds.get(i).games();
            if (answer >= 0 && answer < games.size() && games.get(answer).isOddOne()) {
                score += pointsPerRound;
            }
        }
        return score;
    }

    private int calculateCurrentStreak(List<DailyChallengeResult> results) {
        if (results.isEmpty()) return 0;
        LocalDate expected = LocalDate.now(ZoneOffset.UTC);
        int streak = 0;
        for (DailyChallengeResult r : results) {
            LocalDate date = r.getChallenge().getChallengeDate();
            if (date.equals(expected) || date.equals(expected.minusDays(1)) && streak == 0) {
                streak++;
                expected = date.minusDays(1);
            } else if (!date.equals(expected)) {
                break;
            } else {
                streak++;
                expected = expected.minusDays(1);
            }
        }
        return streak;
    }

    private int calculateLongestStreak(List<DailyChallengeResult> results) {
        if (results.isEmpty()) return 0;
        // Results are ordered newest-first; work through them to find max consecutive run
        List<LocalDate> dates = new ArrayList<>(results.stream()
                .map(r -> r.getChallenge().getChallengeDate())
                .toList());
        dates.sort(null); // ascending

        int longest = 1;
        int current = 1;
        for (int i = 1; i < dates.size(); i++) {
            if (dates.get(i).equals(dates.get(i - 1).plusDays(1))) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 1;
            }
        }
        return longest;
    }

    List<StoredRound> deserializeRounds(String json) {
        try {
            return MAPPER.readValue(json, new TypeReference<List<StoredRound>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Failed to deserialize challenge rounds", e);
        }
    }

    public String serializeRounds(List<StoredRound> rounds) {
        try {
            return MAPPER.writeValueAsString(rounds);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize challenge rounds", e);
        }
    }
}
