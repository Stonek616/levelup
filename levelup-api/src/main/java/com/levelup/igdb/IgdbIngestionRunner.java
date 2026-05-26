package com.levelup.igdb;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("ingest")
public class IgdbIngestionRunner implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(IgdbIngestionRunner.class);

  private final IgdbGameIngestionService gameService;

  public IgdbIngestionRunner(IgdbGameIngestionService gameService) {
    this.gameService = gameService;
  }

  @Override
  public void run(String... args) {
    long start = System.currentTimeMillis();
    log.info("=== Starting IGDB ingestion ===");

    gameService.ingestGames(10000);

    long elapsed = (System.currentTimeMillis() - start) / 1000;
    log.info("=== Ingestion complete in {}s ===", elapsed);
  }
}
