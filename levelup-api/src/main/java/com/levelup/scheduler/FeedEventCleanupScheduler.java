package com.levelup.scheduler;

import com.levelup.repository.FeedEventRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class FeedEventCleanupScheduler {

  private static final Logger log = LoggerFactory.getLogger(FeedEventCleanupScheduler.class);

  private final FeedEventRepository feedEventRepository;

  // Runs at 03:00 UTC every day
  @Scheduled(cron = "0 0 3 * * *")
  @Transactional
  public void deleteOldFeedEvents() {
    Instant cutoff = Instant.now().minus(90, ChronoUnit.DAYS);
    feedEventRepository.deleteByCreatedAtBefore(cutoff);
    log.info("Feed event cleanup complete — deleted events older than 90 days");
  }
}
