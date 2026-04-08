# LevelUp — Spring Boot Project Structure

**Version:** 2.0
**Java:** 21
**Spring Boot:** 3.x
**Build tool:** Maven  

---

## Table of Contents

1. [Project setup](#1-project-setup)
2. [pom.xml dependencies](#2-pomxml-dependencies)
3. [Package structure](#3-package-structure)
4. [application.properties](#4-applicationproperties)
5. [application-dev.properties](#5-application-devproperties)
6. [Docker Compose for local development](#6-docker-compose-for-local-development)
7. [Security configuration](#7-security-configuration)
8. [CORS configuration](#8-cors-configuration)
9. [JWT utility class](#9-jwt-utility-class)
10. [Global exception handler](#10-global-exception-handler)

---

## 1. Project Setup

Generate the project at **start.spring.io** with these settings:

| Setting | Value |
| --- | --- |
| Project | Maven |
| Language | Java |
| Spring Boot | 3.x (latest stable) |
| Group | `com.levelup` |
| Artifact | `levelup-api` |
| Packaging | Jar |
| Java | 21 |

**Dependencies to add at generation:**

- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL Driver
- Validation
- Lombok

---

## 2. pom.xml Dependencies

```xml
<dependencies>

    <!-- Spring Boot starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- PostgreSQL driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- JWT — jjwt library -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.6</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok — reduces boilerplate -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- WebClient for IGDB API calls -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>

    <!-- Hypersistence Utils — PostgreSQL array types, JSONB support -->
    <dependency>
        <groupId>io.hypersistence</groupId>
        <artifactId>hypersistence-utils-hibernate-63</artifactId>
        <version>3.7.3</version>
    </dependency>

    <!-- Flyway — schema migration. Required alongside ddl-auto=validate -->
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-database-postgresql</artifactId>
    </dependency>

    <!-- Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>

</dependencies>
```

---

## 3. Package Structure

Every package lives under `src/main/java/com/levelup/`.

```text
com.levelup/
│
├── LevelUpApiApplication.java          ← Main class — do not modify
│
├── config/
│   ├── SecurityConfig.java             ← Spring Security filter chain, BCrypt bean
│   ├── CorsConfig.java                 ← CORS allowed origins and methods
│   └── WebClientConfig.java            ← WebClient bean configured for IGDB
│
├── security/
│   ├── JwtUtil.java                    ← Generate and validate access + refresh tokens
│   ├── JwtAuthFilter.java              ← Intercepts requests, validates Bearer access token
│   ├── RefreshTokenService.java        ← Manages refresh token creation, rotation, and revocation
│   └── UserDetailsServiceImpl.java     ← Loads user by email for Spring Security
│
├── controller/
│   ├── AuthController.java             ← /api/v1/auth/**
│   ├── UserController.java             ← /api/v1/users/**
│   ├── GameController.java             ← /api/v1/games/**
│   ├── LibraryController.java          ← /api/v1/library/**
│   ├── ReviewController.java           ← /api/v1/games/:id/reviews, /api/v1/reviews/**
│   ├── CommentController.java          ← /api/v1/reviews/:id/comments, /api/v1/comments/**
│   ├── FriendController.java           ← /api/v1/friends/**
│   ├── FeedController.java             ← /api/v1/feed
│   ├── DiscoveryController.java        ← /api/v1/discover/**
│   ├── CollectionController.java       ← /api/v1/collections/**
│   ├── WhatToPlayController.java       ← /api/v1/what-to-play
│   ├── ChallengeController.java        ← /api/v1/challenge/**
│   └── SettingsController.java         ← /api/v1/settings/**
│
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── GameService.java                ← Handles IGDB calls + local cache logic
│   ├── LibraryService.java
│   ├── ReviewService.java
│   ├── CommentService.java
│   ├── FriendService.java
│   ├── FeedService.java
│   ├── DiscoveryService.java
│   ├── CollectionService.java
│   ├── WhatToPlayService.java
│   ├── ChallengeService.java
│   ├── TasteProfileService.java
│   └── IgdbTokenService.java           ← Manages Twitch OAuth token refresh
│
├── repository/
│   ├── UserRepository.java
│   ├── GameRepository.java
│   ├── LibraryEntryRepository.java
│   ├── ReviewRepository.java
│   ├── ReviewCommentRepository.java
│   ├── ReviewLikeRepository.java
│   ├── CommentLikeRepository.java
│   ├── FriendRequestRepository.java
│   ├── FriendshipRepository.java
│   ├── FeedEventRepository.java
│   ├── CollectionRepository.java
│   ├── CollectionEntryRepository.java
│   ├── DailyChallengeRepository.java
│   ├── DailyChallengeResultRepository.java
│   ├── RefreshTokenRepository.java
│   ├── PasswordResetTokenRepository.java
│   └── GameProfileRepository.java
│
├── model/
│   ├── User.java
│   ├── Game.java
│   ├── LibraryEntry.java
│   ├── Review.java
│   ├── ReviewComment.java
│   ├── ReviewLike.java
│   ├── CommentLike.java
│   ├── FriendRequest.java
│   ├── Friendship.java
│   ├── RefreshToken.java
│   ├── PasswordResetToken.java
│   ├── FeedEvent.java
│   ├── Collection.java
│   ├── CollectionEntry.java
│   ├── DailyChallenge.java
│   ├── DailyChallengeResult.java
│   ├── GameProfile.java           ← User's linked gaming platform profiles (PSN, Xbox, Steam)
│   └── enums/
│       ├── LibraryStatus.java          ← WISHLIST, BACKLOG, PLAYING, PLAYED, FINISHED, COMPLETED, ABANDONED
│       ├── FriendshipStatus.java       ← PENDING, ACCEPTED, DECLINED
│       ├── FeedEventType.java          ← STATUS_CHANGE, RATING_ADDED, REVIEW_POSTED, COLLECTION_CREATED, GAME_ADDED
│       └── VisibilityType.java         ← PUBLIC, FRIENDS, PRIVATE
│
├── dto/
│   ├── request/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── UpdateProfileRequest.java
│   │   ├── CreateLibraryEntryRequest.java
│   │   ├── UpdateLibraryEntryRequest.java
│   │   ├── CreateReviewRequest.java
│   │   ├── UpdateReviewRequest.java
│   │   ├── CreateCommentRequest.java
│   │   ├── SendFriendRequestRequest.java
│   │   ├── RespondToFriendRequestRequest.java
│   │   ├── CreateCollectionRequest.java
│   │   ├── UpdateCollectionRequest.java
│   │   ├── AddGameToCollectionRequest.java
│   │   ├── WhatToPlayRequest.java
│   │   ├── UpdateSettingsRequest.java
│   │   ├── DeleteAccountRequest.java
│   │   └── CreateGameProfileRequest.java
│   │
│   └── response/
│       ├── AuthResponse.java
│       ├── UserResponse.java
│       ├── UserSummaryResponse.java
│       ├── GameResponse.java
│       ├── GameSummaryResponse.java
│       ├── LibraryEntryResponse.java
│       ├── ReviewResponse.java
│       ├── CommentResponse.java
│       ├── FriendshipResponse.java
│       ├── FeedEventResponse.java
│       ├── CollectionResponse.java
│       ├── CollectionSummaryResponse.java
│       ├── SharedGameResponse.java
│       ├── TasteProfileResponse.java
│       ├── WhatToPlayResponse.java
│       ├── ChallengeResponse.java
│       ├── ChallengeResultResponse.java
│       ├── ErrorResponse.java
│       └── GameProfileResponse.java
│
├── exception/
│   ├── ResourceNotFoundException.java  ← extends RuntimeException
│   ├── ConflictException.java          ← extends RuntimeException
│   └── ForbiddenException.java         ← extends RuntimeException (NOT Spring's AccessDeniedException)
│
└── scheduler/
    ├── DailyChallengeScheduler.java    ← @Scheduled — generates challenge at midnight UTC
    ├── IgdbTokenRefreshScheduler.java  ← @Scheduled — refreshes Twitch token before expiry
    ├── FeedEventCleanupScheduler.java  ← @Scheduled — deletes feed events older than 90 days
    └── AccountPurgeScheduler.java      ← @Scheduled — permanently deletes soft-deleted accounts after 30 days
```

---

## 4. application.properties

```properties
# ── Server ────────────────────────────────────────────────────────────────────
spring.application.name=levelup-api
server.port=8080

# ── Database ──────────────────────────────────────────────────────────────────
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# ── JPA / Hibernate ───────────────────────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# ── JWT ───────────────────────────────────────────────────────────────────────
jwt.secret=${JWT_SECRET}
jwt.access-token-expiration-ms=900000
jwt.refresh-token-expiration-ms=1209600000

# ── IGDB / Twitch OAuth ───────────────────────────────────────────────────────
igdb.client-id=${TWITCH_CLIENT_ID}
igdb.client-secret=${TWITCH_CLIENT_SECRET}
igdb.token-url=https://id.twitch.tv/oauth2/token
igdb.base-url=https://api.igdb.com/v4

# ── Pagination defaults ───────────────────────────────────────────────────────
spring.data.web.pageable.default-page-size=20
spring.data.web.pageable.max-page-size=50
spring.data.web.pageable.one-indexed-parameters=false

# ── Profiles ──────────────────────────────────────────────────────────────────
spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}
```

**Important:** Never put real secrets in `application.properties`. All sensitive values use `${ENV_VAR}` syntax and are provided as environment variables. In development these come from `application-dev.properties` (git-ignored). In production they come from Railway environment variables.

**Schema migration — Flyway:**
`spring.jpa.hibernate.ddl-auto=validate` is set for production. This means Hibernate will validate entities against the schema on startup and fail if they don't match, but will **not** create or alter tables. Without a migration tool this causes opaque startup failures when the schema drifts from the entities. Add Flyway:

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

Create `src/main/resources/db/migration/V1__initial_schema.sql` with your full DDL (all tables, constraints, indexes). Each subsequent schema change gets a new migration file (`V2__add_column.sql`, etc.). Flyway runs migrations automatically on startup before Hibernate validates — this ensures the schema always matches your entities. In `application-dev.properties`, set `spring.jpa.hibernate.ddl-auto=validate` (same as prod) once Flyway is in place; remove `update` to avoid silent schema drift.

---

## 5. application-dev.properties

Create this file at `src/main/resources/application-dev.properties`. **Add it to `.gitignore` immediately.**

```properties
# ── Local database (Docker Compose) ──────────────────────────────────────────
DB_URL=jdbc:postgresql://localhost:5432/levelup_dev
DB_USERNAME=levelup
DB_PASSWORD=levelup_dev_password

# ── JWT (dev only — any long random string) ───────────────────────────────────
JWT_SECRET=dev_secret_key_replace_this_in_production_must_be_256_bits_long

# ── IGDB (your real Twitch credentials) ───────────────────────────────────────
TWITCH_CLIENT_ID=your_twitch_client_id_here
TWITCH_CLIENT_SECRET=your_twitch_client_secret_here

# ── Dev-only settings ─────────────────────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## 6. Docker Compose for Local Development

Create `docker-compose.yml` in the project root.

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: levelup_postgres
    environment:
      POSTGRES_DB: levelup_dev
      POSTGRES_USER: levelup
      POSTGRES_PASSWORD: levelup_dev_password
    ports:
      - "5432:5432"
    volumes:
      - levelup_postgres_data:/var/lib/postgresql/data

volumes:
  levelup_postgres_data:
```

**Commands:**

```bash
# Start the database
docker-compose up -d

# Stop the database
docker-compose down

# Stop and wipe all data (fresh start)
docker-compose down -v
```

---

## 7. Security Configuration

`src/main/java/com/levelup/config/SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                // Public endpoints — game browsing
                .requestMatchers(HttpMethod.GET, "/api/v1/games/**").permitAll()
                // Public endpoints — discovery
                .requestMatchers(HttpMethod.GET, "/api/v1/discover/trending").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/discover/new").permitAll()
                // Public endpoints — user profiles and taste profiles
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}/taste-profile").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}/reviews").permitAll()
                // Public endpoints — reviews and collections
                .requestMatchers(HttpMethod.GET, "/api/v1/reviews/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/collections/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}/collections").permitAll()
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

---

## 8. CORS Configuration

`src/main/java/com/levelup/config/CorsConfig.java`

```java
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```

Add to `application-dev.properties`:

```properties
cors.allowed-origins=http://localhost:4200
```

---

## 9. JWT Utility Class

`src/main/java/com/levelup/security/JwtUtil.java`

```java
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration-ms}")
    private long accessTokenExpirationMs;    // 15 minutes

    @Value("${jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;   // 2 weeks

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateAccessToken(String email) {
        return Jwts.builder()
            .subject(email)
            .claim("type", "access")
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    public String generateRefreshToken(String email) {
        return Jwts.builder()
            .subject(email)
            .claim("type", "refresh")
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshTokenExpirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    public long getRefreshTokenExpirationMs() {
        return refreshTokenExpirationMs;
    }

    public String extractEmail(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

---

## 10. Global Exception Handler

`src/main/java/com/levelup/controller/GlobalExceptionHandler.java`

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("RESOURCE_NOT_FOUND", 404, ex.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex) {
        return ResponseEntity.status(403)
            .body(new ErrorResponse("FORBIDDEN", 403, "You do not have permission to perform this action"));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse("CONFLICT", 409, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> fields = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(err -> fields.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.status(400)
            .body(new ValidationErrorResponse("VALIDATION_FAILED", 400,
                "Request body contains invalid fields", fields));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(500)
            .body(new ErrorResponse("INTERNAL_SERVER_ERROR", 500,
                "An unexpected error occurred"));
    }
}
```

Custom exception classes are in `src/main/java/com/levelup/exception/`:

- `ResourceNotFoundException.java` extends `RuntimeException`
- `ConflictException.java` extends `RuntimeException`
- `ForbiddenException.java` extends `RuntimeException` — named to avoid collision with Spring Security's `org.springframework.security.access.AccessDeniedException`

---

LevelUp — Spring Boot Project Structure — v3.0

---

### Changelog (v4.0)

- Added Flyway dependencies and migration note — `ddl-auto=validate` requires Flyway to manage schema; added initial migration file location (`db/migration/V1__initial_schema.sql`)

### Changelog (v3.0)

- Added `GameProfile.java` entity to `model/` package
- Added `GameProfileRepository.java` to `repository/` package

### Changelog (v2.0)

- Added `hypersistence-utils-hibernate-63` dependency for PostgreSQL array type support
- Updated JWT to dual-token model: access tokens (15 min) and refresh tokens (2 weeks)
- Added `RefreshTokenService` to security package
- Added `FriendRequest`, `RefreshToken`, `PasswordResetToken` models
- Added `FriendRequestRepository`, `RefreshTokenRepository`, `PasswordResetTokenRepository`
- Added `FeedEventCleanupScheduler` and `AccountPurgeScheduler` to scheduler package
- Fixed security config to match actual API endpoint paths (removed `/api/v1/profile/**`, added correct `/api/v1/users/{username}` patterns)
- Renamed `AccessDeniedException` to `ForbiddenException` to avoid Spring Security name collision
- Added `DeleteAccountRequest`, `CreateGameProfileRequest`, `GameProfileResponse` DTOs
- Added exception package to structure listing
