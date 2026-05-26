package com.levelup.scheduler;

import com.levelup.model.DailyChallenge;
import com.levelup.model.Game;
import com.levelup.repository.DailyChallengeRepository;
import com.levelup.repository.GameRepository;
import com.levelup.service.ChallengeService;
import com.levelup.service.ChallengeService.StoredGame;
import com.levelup.service.ChallengeService.StoredRound;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DailyChallengeScheduler {

    private static final Logger log = LoggerFactory.getLogger(DailyChallengeScheduler.class);
    private static final int ROUNDS = 4;
    private static final int MIN_GAMES_PER_GENRE = 5;

    private final DailyChallengeRepository challengeRepository;
    private final GameRepository gameRepository;
    private final ChallengeService challengeService;

    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    @Transactional
    public void generateDailyChallenge() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        if (challengeRepository.existsByChallengeDate(today)) {
            log.info("Challenge already exists for {}", today);
            return;
        }
        tryGenerate(today);
    }

    // Exposed for manual seeding (e.g. on first startup or admin trigger)
    @Transactional
    public void generateForDate(LocalDate date) {
        if (challengeRepository.existsByChallengeDate(date)) return;
        tryGenerate(date);
    }

    private void tryGenerate(LocalDate date) {
        try {
            List<String> eligibleGenres = gameRepository.findGenreNamesWithMinGameCount(MIN_GAMES_PER_GENRE);
            if (eligibleGenres.size() < ROUNDS) {
                log.warn("Not enough genres with {} games to generate a challenge", MIN_GAMES_PER_GENRE);
                return;
            }

            Random rng = new Random();
            List<String> shuffled = new ArrayList<>(eligibleGenres);
            Collections.shuffle(shuffled, rng);
            List<String> selectedGenres = shuffled.subList(0, ROUNDS);

            List<StoredRound> rounds = new ArrayList<>();
            for (int i = 0; i < selectedGenres.size(); i++) {
                String genre = selectedGenres.get(i);
                StoredRound round = buildRound(i + 1, genre, rng);
                if (round == null) {
                    log.warn("Could not build round for genre '{}' — skipping challenge generation", genre);
                    return;
                }
                rounds.add(round);
            }

            DailyChallenge challenge = new DailyChallenge();
            challenge.setChallengeDate(date);
            challenge.setChallengeType("ODD_ONE_OUT");
            challenge.setRounds(challengeService.serializeRounds(rounds));
            challengeRepository.save(challenge);
            log.info("Generated daily challenge for {}", date);

        } catch (Exception e) {
            log.error("Failed to generate daily challenge for {}", date, e);
        }
    }

    private StoredRound buildRound(int roundNumber, String genre, Random rng) {
        List<UUID> withGenre = new ArrayList<>(gameRepository.findIdsByGenreName(genre));
        List<UUID> withoutGenre = new ArrayList<>(gameRepository.findIdsNotHavingGenre(genre));

        if (withGenre.size() < 3 || withoutGenre.isEmpty()) return null;

        Collections.shuffle(withGenre, rng);
        Collections.shuffle(withoutGenre, rng);

        List<UUID> memberIds = withGenre.subList(0, 3);
        UUID oddId = withoutGenre.get(0);

        // Batch-load the 4 games
        List<UUID> allIds = new ArrayList<>(memberIds);
        allIds.add(oddId);
        List<Game> games = gameRepository.findByIdInWithGenres(allIds);

        List<StoredGame> storedGames = new ArrayList<>();
        for (Game g : games) {
            String coverUrl = g.getCoverImageId() != null
                    ? "https://images.igdb.com/igdb/image/upload/t_cover_big/" + g.getCoverImageId() + ".jpg"
                    : null;
            boolean isOddOne = g.getId().equals(oddId);
            storedGames.add(new StoredGame(g.getId().toString(), g.getTitle(), coverUrl, isOddOne));
        }

        Collections.shuffle(storedGames, rng);
        return new StoredRound(roundNumber, genre, storedGames);
    }
}
