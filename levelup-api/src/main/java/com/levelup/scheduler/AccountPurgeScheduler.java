package com.levelup.scheduler;

import com.levelup.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AccountPurgeScheduler {

  private static final Logger log = LoggerFactory.getLogger(AccountPurgeScheduler.class);
  private static final int GRACE_PERIOD_DAYS = 30;

  private final UserRepository userRepository;

  @Scheduled(cron = "0 0 3 * * *", zone = "UTC")
  @Transactional
  public void purgeExpiredAccounts() {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(GRACE_PERIOD_DAYS);
    List<UUID> ids =
        userRepository.findSoftDeletedBefore(cutoff).stream().map(u -> u.getId()).toList();

    if (ids.isEmpty()) return;

    ids.forEach(userRepository::deleteById);
    log.info(
        "Purged {} soft-deleted account(s) past the {} day grace period",
        ids.size(),
        GRACE_PERIOD_DAYS);
  }
}
