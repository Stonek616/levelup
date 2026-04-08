# LevelUp — Spring Boot Patterns & Skeletons

**Version:** 2.0
**Purpose:** Reusable patterns for controllers, services, repositories, and entities. Follow these templates consistently for every feature so the codebase stays uniform.

---

## Table of Contents

1. [Entity pattern](#1-entity-pattern)
2. [Repository pattern](#2-repository-pattern)
3. [DTO pattern](#3-dto-pattern)
4. [Service pattern](#4-service-pattern)
5. [Controller pattern](#5-controller-pattern)
6. [Complete worked example — Library feature](#6-complete-worked-example--library-feature)
7. [IGDB service pattern](#7-igdb-service-pattern)
8. [Scheduler pattern](#8-scheduler-pattern)

---

## 1. Entity Pattern

Every entity follows the same structure. Use Lombok to eliminate boilerplate.

```java
@Entity
@Table(name = "library_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Many-to-one relationships — use @ManyToOne + @JoinColumn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    // Enum columns — store as STRING not ORDINAL
    // ORDINAL breaks if you ever reorder the enum values
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LibraryStatus status;

    // NOTE: Lombok generates isOwned() getter and setOwned() setter for boolean fields
    // with the "is" prefix. Jackson serializes using the getter name, which may produce
    // "owned" instead of "isOwned" in the JSON output. This is safe because DTOs handle
    // the mapping explicitly via LibraryEntryResponse.from() — never serialize entities
    // directly. Always go through the DTO; never return raw entities from controllers.
    @Column(name = "is_owned", nullable = false)
    private boolean isOwned = false;

    // PostgreSQL TEXT[] column — requires hibernate-types dependency
    @Type(StringArrayType.class)
    @Column(name = "platforms", columnDefinition = "text[]")
    private String[] platforms;

    @Column
    private Integer rating;

    // Timestamps — always use @CreationTimestamp and @UpdateTimestamp
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Unique constraint — defined at class level
    // Matches UNIQUE(user_id, game_id) in the data model
}

// Add unique constraint at the @Table annotation:
// @Table(name = "library_entries",
//        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "game_id"}))
```

**Rules to always follow:**

- Use `FetchType.LAZY` on all relationships — never EAGER
- Store enums as `EnumType.STRING` — never `ORDINAL`
- Use `@CreationTimestamp` and `@UpdateTimestamp` for audit fields
- Use `@Builder` to construct entities in service layer
- For PostgreSQL array columns (`TEXT[]`), use `@Type(StringArrayType.class)` from `io.hypersistence:hypersistence-utils-hibernate-63` — standard JPA does not support PostgreSQL arrays natively
- **Version check:** The `63` suffix in `hypersistence-utils-hibernate-63` refers to Hibernate 6.3 compatibility. Spring Boot 3.x bundles Hibernate 6.2 by default (6.3+ appears in later point releases). Verify your exact Spring Boot version's bundled Hibernate before starting: run `mvn dependency:tree | grep hibernate-core` and confirm the major.minor matches the `63` suffix. A mismatch causes confusing class-incompatibility errors at startup. If you are on Hibernate 6.2, use the `62` artifact instead.

---

## 2. Repository Pattern

Spring Data JPA repositories — declare custom queries as methods and let Spring generate the SQL.

```java
@Repository
public interface LibraryEntryRepository extends JpaRepository<LibraryEntry, UUID> {

    // Spring generates: SELECT * FROM library_entries WHERE user_id = ?
    Page<LibraryEntry> findByUserId(UUID userId, Pageable pageable);

    // Filter by status
    Page<LibraryEntry> findByUserIdAndStatus(
        UUID userId, LibraryStatus status, Pageable pageable);

    // Filter by owned flag
    Page<LibraryEntry> findByUserIdAndIsOwned(
        UUID userId, boolean isOwned, Pageable pageable);

    // Check for existence — used before creating to prevent duplicates
    boolean existsByUserIdAndGameId(UUID userId, UUID gameId);

    // Find specific entry
    Optional<LibraryEntry> findByUserIdAndGameId(UUID userId, UUID gameId);

    // Custom JPQL query — for complex logic Spring can't infer from method name
    @Query("""
        SELECT le FROM LibraryEntry le
        WHERE le.user.id = :userId
        AND le.isOwned = true
        AND le.game.id IN (
            SELECT le2.game.id FROM LibraryEntry le2
            WHERE le2.user.id = :friendId
            AND le2.isOwned = true
        )
    """)
    Page<LibraryEntry> findSharedOwnedGames(
        @Param("userId") UUID userId,
        @Param("friendId") UUID friendId,
        Pageable pageable);

    // owned filter — Spring Data generates this from method name
    Page<LibraryEntry> findByUserIdAndIsOwned(UUID userId, boolean isOwned, Pageable pageable);
    Page<LibraryEntry> findByUserIdAndStatusAndIsOwned(UUID userId, LibraryStatus status, boolean isOwned, Pageable pageable);

    // Platform filter — PostgreSQL TEXT[] requires a native query with array containment.
    // Spring Data method naming cannot generate array operations; native SQL is clearest here.
    @Query(value = """
        SELECT * FROM library_entries
        WHERE user_id = :userId
        AND :platform = ANY(platforms)
    """, nativeQuery = true)
    Page<LibraryEntry> findByUserIdAndPlatform(
        @Param("userId") UUID userId,
        @Param("platform") String platform,
        Pageable pageable);

    @Query(value = """
        SELECT * FROM library_entries
        WHERE user_id = :userId
        AND status = :#{#status.name()}
        AND :platform = ANY(platforms)
    """, nativeQuery = true)
    Page<LibraryEntry> findByUserIdAndStatusAndPlatform(
        @Param("userId") UUID userId,
        @Param("status") LibraryStatus status,
        @Param("platform") String platform,
        Pageable pageable);

    @Query(value = """
        SELECT * FROM library_entries
        WHERE user_id = :userId
        AND is_owned = :owned
        AND :platform = ANY(platforms)
    """, nativeQuery = true)
    Page<LibraryEntry> findByUserIdAndIsOwnedAndPlatform(
        @Param("userId") UUID userId,
        @Param("owned") boolean owned,
        @Param("platform") String platform,
        Pageable pageable);

    @Query(value = """
        SELECT * FROM library_entries
        WHERE user_id = :userId
        AND status = :#{#status.name()}
        AND is_owned = :owned
        AND :platform = ANY(platforms)
    """, nativeQuery = true)
    Page<LibraryEntry> findByUserIdAndStatusAndIsOwnedAndPlatform(
        @Param("userId") UUID userId,
        @Param("status") LibraryStatus status,
        @Param("owned") boolean owned,
        @Param("platform") String platform,
        Pageable pageable);
}
```

**Rules to always follow:**

- Return `Optional<T>` for single results that may not exist
- Return `Page<T>` for list results — always paginate
- Use JPQL (`@Query`) not native SQL unless absolutely necessary
- Never fetch entire collections in a loop — use batch queries

---

## 3. DTO Pattern

DTOs prevent entity leakage to the API layer. Every API request uses a request DTO and every response uses a response DTO.

### Request DTO — use Bean Validation annotations

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLibraryEntryRequest {

    @NotNull(message = "gameId is required")
    private UUID gameId;

    @NotNull(message = "status is required")
    private LibraryStatus status;

    @NotNull(message = "isOwned is required")
    private Boolean isOwned;

    private List<String> platforms;
}
```

### Response DTO — map from entity in service layer

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibraryEntryResponse {

    private UUID id;
    private GameSummaryResponse game;
    private LibraryStatus status;
    private boolean isOwned;
    private List<String> platforms;
    private Integer rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Static factory method — keeps mapping logic in the DTO
    public static LibraryEntryResponse from(LibraryEntry entry) {
        return LibraryEntryResponse.builder()
            .id(entry.getId())
            .game(GameSummaryResponse.from(entry.getGame()))
            .status(entry.getStatus())
            .isOwned(entry.isOwned())
            .platforms(entry.getPlatforms() != null ? List.of(entry.getPlatforms()) : List.of())
            .rating(entry.getRating())
            .createdAt(entry.getCreatedAt())
            .updatedAt(entry.getUpdatedAt())
            .build();
    }
}
```

**Rules to always follow:**

- Never return entities from controllers — always map to a response DTO first
- Put mapping logic in the DTO as a static `from()` method
- Use `@Valid` on controller method parameters to trigger Bean Validation
- Keep request DTOs and response DTOs in separate `request/` and `response/` packages

---

## 4. Service Pattern

Services own all business logic. Controllers call services — they never touch repositories directly.

```java
@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryEntryRepository libraryEntryRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final FeedService feedService;

    public Page<LibraryEntryResponse> getUserLibrary(
            UUID userId, LibraryStatus status, Boolean owned,
            String platform, Pageable pageable) {

        // Build query based on which filters are present.
        // owned is applied via a Spring Data method name query when set.
        Page<LibraryEntry> entries;

        if (status != null && platform != null && owned != null) {
            entries = libraryEntryRepository
                .findByUserIdAndStatusAndIsOwnedAndPlatform(userId, status, owned, platform, pageable);
        } else if (status != null && platform != null) {
            entries = libraryEntryRepository
                .findByUserIdAndStatusAndPlatform(userId, status, platform, pageable);
        } else if (status != null && owned != null) {
            entries = libraryEntryRepository
                .findByUserIdAndStatusAndIsOwned(userId, status, owned, pageable);
        } else if (platform != null && owned != null) {
            entries = libraryEntryRepository
                .findByUserIdAndIsOwnedAndPlatform(userId, owned, platform, pageable);
        } else if (status != null) {
            entries = libraryEntryRepository
                .findByUserIdAndStatus(userId, status, pageable);
        } else if (owned != null) {
            entries = libraryEntryRepository
                .findByUserIdAndIsOwned(userId, owned, pageable);
        } else if (platform != null) {
            entries = libraryEntryRepository
                .findByUserIdAndPlatform(userId, platform, pageable);
        } else {
            entries = libraryEntryRepository
                .findByUserId(userId, pageable);
        }

        return entries.map(LibraryEntryResponse::from);
    }

    public LibraryEntryResponse addToLibrary(
            UUID userId, CreateLibraryEntryRequest request) {

        // Guard: check game exists
        Game game = gameRepository.findById(request.getGameId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Game with id '" + request.getGameId() + "' not found"));

        // Guard: check entry doesn't already exist
        if (libraryEntryRepository.existsByUserIdAndGameId(userId, request.getGameId())) {
            throw new ConflictException("Game is already in your library");
        }

        User user = userRepository.getReferenceById(userId);

        LibraryEntry entry = LibraryEntry.builder()
            .user(user)
            .game(game)
            .status(request.getStatus())
            .isOwned(request.getIsOwned())
            .platforms(request.getPlatforms() != null ? request.getPlatforms().toArray(new String[0]) : new String[0])
            .build();

        LibraryEntry saved = libraryEntryRepository.save(entry);

        // Side effect: create feed event
        feedService.createEvent(userId, game.getId(), FeedEventType.GAME_ADDED,
            Map.of("status", request.getStatus()));

        return LibraryEntryResponse.from(saved);
    }

    public LibraryEntryResponse updateEntry(
            UUID entryId, UUID requestingUserId,
            UpdateLibraryEntryRequest request) {

        LibraryEntry entry = libraryEntryRepository.findById(entryId)
            .orElseThrow(() -> new ResourceNotFoundException("Library entry not found"));

        // Ownership check
        if (!entry.getUser().getId().equals(requestingUserId)) {
            throw new ForbiddenException("You do not own this library entry");
        }

        // Capture old values before mutation for feed event comparison
        LibraryStatus oldStatus = entry.getStatus();
        Integer oldRating = entry.getRating();

        // Only update fields that were provided
        if (request.getStatus() != null) entry.setStatus(request.getStatus());
        if (request.getIsOwned() != null) entry.setOwned(request.getIsOwned());
        if (request.getPlatforms() != null) entry.setPlatforms(request.getPlatforms().toArray(new String[0]));
        if (request.getRating() != null) entry.setRating(request.getRating());

        LibraryEntry saved = libraryEntryRepository.save(entry);

        // Side effect: STATUS_CHANGE feed event when status actually changed
        if (request.getStatus() != null && !request.getStatus().equals(oldStatus)) {
            feedService.createEvent(requestingUserId, saved.getGame().getId(),
                FeedEventType.STATUS_CHANGE,
                Map.of("oldStatus", oldStatus, "newStatus", request.getStatus()));
        }

        // Side effect: RATING_ADDED feed event when rating was set or changed.
        // FeedService handles deduplication — if a RATING_ADDED event for this
        // user + game exists within the past 24 hours, it updates the metadata
        // instead of creating a new event.
        if (request.getRating() != null && !request.getRating().equals(oldRating)) {
            feedService.createOrUpdateRatingEvent(requestingUserId, saved.getGame().getId(),
                request.getRating());
        }

        return LibraryEntryResponse.from(saved);
    }

    public void deleteEntry(UUID entryId, UUID requestingUserId) {
        LibraryEntry entry = libraryEntryRepository.findById(entryId)
            .orElseThrow(() -> new ResourceNotFoundException("Library entry not found"));

        if (!entry.getUser().getId().equals(requestingUserId)) {
            throw new ForbiddenException("You do not own this library entry");
        }

        libraryEntryRepository.delete(entry);
    }
}
```

**Rules to always follow:**

- Throw custom exceptions (`ResourceNotFoundException`, `ConflictException`, `ForbiddenException`) — the `GlobalExceptionHandler` catches these and returns the right HTTP status. `ForbiddenException` is named to avoid collision with Spring Security's `AccessDeniedException`
- Always check ownership before mutating a resource
- Map entities to DTOs before returning — never return raw entities
- Use `getReferenceById()` when you only need a reference for a foreign key — it avoids a SELECT

---

## 5. Controller Pattern

Controllers are thin — they receive a request, call a service, and return a response. No business logic lives here.

```java
@RestController
@RequestMapping("/api/v1/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    // Get current user's library
    @GetMapping
    public ResponseEntity<Page<LibraryEntryResponse>> getLibrary(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) LibraryStatus status,
            @RequestParam(required = false) Boolean owned,
            @RequestParam(required = false) String platform,
            Pageable pageable) {

        Page<LibraryEntryResponse> entries = libraryService.getUserLibrary(
            userDetails.getId(), status, owned, platform, pageable);
        return ResponseEntity.ok(entries);
    }

    // Add game to library
    @PostMapping
    public ResponseEntity<LibraryEntryResponse> addToLibrary(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CreateLibraryEntryRequest request) {

        LibraryEntryResponse entry = libraryService.addToLibrary(
            userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }

    // Update a library entry
    @PatchMapping("/{entryId}")
    public ResponseEntity<LibraryEntryResponse> updateEntry(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID entryId,
            @Valid @RequestBody UpdateLibraryEntryRequest request) {

        LibraryEntryResponse entry = libraryService.updateEntry(
            entryId, userDetails.getId(), request);
        return ResponseEntity.ok(entry);
    }

    // Delete a library entry
    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteEntry(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID entryId) {

        libraryService.deleteEntry(entryId, userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
```

**Rules to always follow:**

- Use `@AuthenticationPrincipal UserDetailsImpl userDetails` to get the current user — never accept userId as a request parameter
- Use `@Valid` on `@RequestBody` parameters to trigger validation
- Return `ResponseEntity<T>` with explicit status codes — `201 CREATED` for POST, `204 NO_CONTENT` for DELETE, `200 OK` for GET/PATCH
- Use `@PathVariable` for resource IDs, `@RequestParam` for optional filters

---

## 6. Complete Worked Example — Library Feature

This shows how all the layers connect for a single feature. Use this as the reference when building each new feature.

```text
Request arrives at LibraryController.addToLibrary()
  ↓
@Valid validates CreateLibraryEntryRequest (400 if invalid)
  ↓
LibraryController calls libraryService.addToLibrary(userId, request)
  ↓
LibraryService checks game exists (404 if not)
LibraryService checks entry doesn't exist (409 if duplicate)
LibraryService builds LibraryEntry entity
LibraryService calls libraryEntryRepository.save(entry)
LibraryService calls feedService.createEvent(...) as side effect
LibraryService maps LibraryEntry → LibraryEntryResponse via from()
  ↓
LibraryController returns ResponseEntity.status(201).body(entryResponse)
  ↓
Response serialised to JSON and returned to Angular client
```

---

## 7. IGDB Service Pattern

The `GameService` is the only service that calls IGDB. All other services that need game data call `GameService` — never IGDB directly.

```java
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final WebClient igdbWebClient;        // Configured in WebClientConfig
    private final IgdbTokenService igdbTokenService;

    // Search — always queries IGDB and merges with local cache
    // Never returns local-only results to ensure complete search results
    public Page<GameSummaryResponse> searchGames(String query, Pageable pageable) {

        // Always query IGDB for fresh results
        List<IgdbGameDto> igdbResults = fetchFromIgdb(query);

        // Cache/update results locally (upsert by igdb_id)
        List<Game> fromIgdb = igdbResults.stream()
            .map(this::mapAndSave)
            .toList();

        // Combine with any local-only matches (e.g. games cached from
        // previous searches that match but aren't in this IGDB result set)
        Set<Integer> igdbIds = fromIgdb.stream()
            .map(Game::getIgdbId).collect(Collectors.toSet());
        List<Game> localOnly = gameRepository
            .findByTitleContainingIgnoreCase(query, Pageable.unpaged())
            .stream()
            .filter(g -> !igdbIds.contains(g.getIgdbId()))
            .toList();

        List<Game> combined = new ArrayList<>(fromIgdb);
        combined.addAll(localOnly);

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), combined.size());
        List<GameSummaryResponse> page = combined.subList(start, end)
            .stream().map(GameSummaryResponse::from).toList();

        return new PageImpl<>(page, pageable, combined.size());
    }

    private List<IgdbGameDto> fetchFromIgdb(String query) {
        String token = igdbTokenService.getValidToken();

        return igdbWebClient.post()
            .uri("/games")
            .header("Client-ID", igdbClientId)
            .header("Authorization", "Bearer " + token)
            .bodyValue(buildIgdbQuery(query))
            .retrieve()
            .bodyToFlux(IgdbGameDto.class)
            .collectList()
            .block();
    }

    private String buildIgdbQuery(String query) {
        return String.format(
            "fields id,name,cover.url,first_release_date,genres.name," +
            "platforms.name,themes.name,game_modes.name,summary;" +
            "search \"%s\"; limit 10;", query);
    }

    private Game mapAndSave(IgdbGameDto dto) {
        // Upsert — update if already cached (or stale), insert if new
        // Games cached more than 30 days ago are refreshed with new IGDB data
        return gameRepository.findByIgdbId(dto.getId())
            .map(existing -> updateExisting(existing, dto))
            .orElseGet(() -> saveNew(dto));
    }
}
```

---

## 8. Scheduler Pattern

Two scheduled jobs run in the background. Both use Spring's `@Scheduled` annotation.

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class IgdbTokenRefreshScheduler {

    private final IgdbTokenService igdbTokenService;

    // Run every 55 days — token expires at 60 days, refresh before expiry
    @Scheduled(fixedRate = 55, timeUnit = TimeUnit.DAYS)
    public void refreshToken() {
        log.info("Refreshing IGDB token...");
        igdbTokenService.refreshToken();
        log.info("IGDB token refreshed successfully");
    }
}

@Component
@RequiredArgsConstructor
@Slf4j
public class DailyChallengeScheduler {

    private final ChallengeService challengeService;

    // Run every day at midnight UTC
    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    public void generateDailyChallenge() {
        log.info("Generating daily challenge for {}",
            LocalDate.now(ZoneOffset.UTC));
        challengeService.generateTodaysChallenge();
        log.info("Daily challenge generated");
    }
}
```

Add this to `LevelUpApiApplication.java` to enable scheduling:

```java
@SpringBootApplication
@EnableScheduling
public class LevelUpApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(LevelUpApiApplication.class, args);
    }
}
```

---

LevelUp — Spring Boot Patterns & Skeletons — v3.0

---

### Changelog (v4.0)

- Fixed `getUserLibrary` — `owned` parameter was also silently ignored alongside `platform`; added full branching logic covering all filter combinations (status, owned, platform) in the service and four native `@Query` repository methods for platform + owned combinations
- Fixed `updateEntry` — added `STATUS_CHANGE` and `RATING_ADDED` feed event side effects; captures old values before mutation and compares to determine if events should fire; delegates RATING_ADDED deduplication to FeedService
- Added `isOwned` Lombok/Jackson serialization warning — always map through DTO, never serialize entity directly

### Changelog (v3.0)

- Fixed `getUserLibrary` — `platform` parameter was accepted but silently ignored; added branching logic in the service and two native `@Query` repository methods using PostgreSQL `= ANY(platforms)` array containment syntax
- Added hypersistence-utils version check warning — `63` suffix must match bundled Hibernate version; added verification command

### Changelog (v2.0)

- Renamed `AccessDeniedException` to `ForbiddenException` to avoid collision with Spring Security's class of the same name
- Updated platform field from `String` to `String[]` with `@Type(StringArrayType.class)` for PostgreSQL array support
- Added note about `hypersistence-utils` dependency for PostgreSQL array types
- Fixed game search to always query IGDB and merge with local cache instead of returning local-only results
- Added IGDB cache staleness handling (30-day refresh)
- Updated DTO mapping for array platform field
