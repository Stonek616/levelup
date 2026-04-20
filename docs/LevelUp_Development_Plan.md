# LevelUp — Development Plan

**Version:** 2.0  
**Last updated:** 2026-04-09  
**This document is the single source of truth for what to build and in what order.**

---

## How to use this document

Read each phase fully before starting it. Every phase tells you:

- What to build and in what order
- Why the order matters
- What concept you are learning and where to learn it
- Which other doc to consult for exact patterns and code shapes
- What a working checkpoint looks like

The other documents in `/docs` are reference material — they contain exact code patterns, full file structures, and API shapes. **This document tells you what to do. The others show you how.**

| Reference doc | What it covers |
| --- | --- |
| `LevelUp_Getting_Started.md` | One-time environment setup — tools to install, Docker, project generation |
| `LevelUp_SpringBoot_Structure.md` | Package structure, `pom.xml`, `application.properties`, security + JWT classes |
| `LevelUp_SpringBoot_Patterns.md` | Entity, Repository, DTO, Service, Controller patterns with full worked examples |
| `LevelUp_Angular_Structure.md` | Folder structure, `app.config.ts`, interceptors, signal pattern, CLI cheatsheet |
| `LevelUp_TypeScript_Models.md` | All TypeScript interfaces and enums, one per feature domain |
| `LevelUp_API_Endpoints.md` | Complete API contract — every endpoint, its method, request body, and response shape |
| `LevelUp_Frontend_Routing.md` | All Angular routes and which guards protect them |
| `LevelUp_Design_Document.md` | Product vision, feature descriptions, user stories, and data model ERD |

---

## The rule for every feature (read this once, apply it every time)

Each feature follows the same build order:

```text
1. Write the Flyway SQL migration for any new tables
2. Build the Spring Boot side:  entity → repository → service → controller → DTOs
3. Build the Angular side:      service → component(s) → routing
4. Test end-to-end before moving on
```

This is called a **vertical slice** — you build backend and frontend together for one feature before starting the next. The alternative (build all backend first, then all frontend) means you go weeks without seeing anything work. Vertical slices let you test the full flow at every step and catch integration problems early.

Do not skip ahead. Later phases have real dependencies on earlier ones.

---

## A critical note about Flyway migrations

**Flyway requires a very specific naming convention for migration files.** This is one of the most common sources of confusing errors when starting out.

The correct format is: `V{number}__{description}.sql`  

- Uppercase `V`
- A version number (1, 2, 3...)
- **Two underscores** (not one)
- A short description
- `.sql` extension

Example: `V1__initial_schema.sql`

**Current issue:** The file in this project is currently named `v1_initial_schema.sql` (lowercase v, single underscore). Flyway will silently ignore this file and then fail with a validation error because the schema doesn't exist. **Rename it to `V1__initial_schema.sql` before running Spring Boot.**

The Flyway docs are the authoritative source: [Source](https://documentation.red-gate.com/fd/migrations-184127470.html)

Every time you add a new entity, add its `CREATE TABLE` SQL to this migration file — or if the migration has already been applied to the database, create a new numbered file (`V2__add_games_table.sql`). **Never edit a migration file that has already been applied.** Flyway tracks which migrations have run in a `flyway_schema_history` table. If you edit a file that has already run, Flyway will fail on next startup with a checksum mismatch error.

---

## A note on `application-dev.properties` and `ddl-auto`

There is a discrepancy between the Getting Started guide and the Spring Boot Structure doc on this setting. The correct approach:

- **Before Flyway is set up:** Use `spring.jpa.hibernate.ddl-auto=create-drop` or `update` in dev only — this lets Hibernate create tables automatically so you can boot without a migration.
- **Once Flyway is in place (Phase 0 is complete):** Change dev to `spring.jpa.hibernate.ddl-auto=validate`, same as production. This means Hibernate validates that your entities match the schema Flyway created, but does not modify the schema itself. If they don't match, you get a clear error telling you exactly what is missing.

Using `validate` in both environments catches drift early and keeps dev and prod behavior identical. The `update` mode hides schema problems by silently adding columns — this is convenient early on but causes subtle bugs later.

---

## A note on `igdb.bearer-token` in application.properties

The current `application.properties` has a line `igdb.bearer-token=${BEARER_TOKEN}` that is **not in any of the reference docs and should not be there**. The IGDB Bearer token is fetched programmatically by `IgdbTokenService` — you do not store it as a property. Remove that line from `application.properties`.

---

## Phase 0 — Project Foundation

**Status: In progress.** The Spring Boot and Angular projects have been generated. The tasks remaining are detailed below.

This phase produces no visible features. It is the skeleton everything else attaches to. Getting it right here means every subsequent phase is straightforward. Rushing it means you will be debugging infrastructure instead of building features.

---

### 0.1 Fix the migration file name

**Before anything else:** rename `v1_initial_schema.sql` to `V1__initial_schema.sql` in `src/main/resources/db/migration/`.

The file already has the correct `CREATE TABLE` SQL for `users`, `refresh_tokens`, and `password_reset_tokens`. You will add more tables to this same file as you build each entity in later phases.

---

### 0.2 Fix application.properties

Remove the `igdb.bearer-token=${BEARER_TOKEN}` line from `application.properties`. That token is managed in memory by `IgdbTokenService`, not as a property.

---

### 0.3 Spring Boot infrastructure — what you are building and why

This is the wiring that every subsequent backend feature depends on. You are building:

**Security layer:**

- `SecurityConfig.java` — tells Spring Security which endpoints are public and which require a JWT. Also registers the BCrypt password encoder and the JWT filter.
- `JwtUtil.java` — generates and validates access tokens (short-lived, 15 min) and refresh tokens (long-lived, 2 weeks).
- `JwtAuthFilter.java` — intercepts every HTTP request, reads the `Authorization: Bearer <token>` header, validates the token, and sets the authenticated user in Spring's security context so controllers can access it via `@AuthenticationPrincipal`.
- `UserDetailsServiceImpl.java` — Spring Security calls this to load a `UserDetails` object by email. This is the bridge between your `User` entity and Spring's auth system.
- `RefreshTokenService.java` — manages the refresh token lifecycle: creating, rotating on use, and revoking on logout.

**Error handling:**

- `GlobalExceptionHandler.java` — a `@RestControllerAdvice` class that catches your custom exceptions and converts them to consistent JSON error responses. Without this, Spring returns opaque 500 errors for anything that isn't handled.
- Custom exceptions: `ResourceNotFoundException`, `ConflictException`, `ForbiddenException`.

**CORS:**

- `CorsConfig.java` — tells Spring to allow requests from `http://localhost:4200` (the Angular dev server). Without this, your browser will block all API calls with a CORS error.

**Where to learn the concepts:**

- Spring Security fundamentals: [Spring.io](https://spring.io/guides/gs/securing-web/)
- JWT explained visually: [JWT](https://jwt.io/introduction)
- Spring Security filter chain: [Spring filter Chain](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- `@RestControllerAdvice` and exception handling: [exception handling](https://www.baeldung.com/exception-handling-for-rest-with-spring)

**Exact code for all of these is in `LevelUp_SpringBoot_Structure.md` sections 7–10.**

**Build order within 0.3:**

1. Custom exception classes first (they are dependencies of everything else)
2. `GlobalExceptionHandler.java`
3. `JwtUtil.java`
4. `UserDetailsServiceImpl.java`
5. `RefreshTokenService.java`
6. `JwtAuthFilter.java`
7. `CorsConfig.java`
8. `SecurityConfig.java` (depends on JwtAuthFilter and UserDetailsServiceImpl)

**Checkpoint:** Spring Boot starts without errors when you run it. You will get a Flyway/schema error if the migration file is not named correctly — fix that first (step 0.1).

---

### 0.4 Angular infrastructure — what you are building and why

**What standalone Angular means:**  
Angular 17+ uses standalone components by default. In older Angular, you needed `NgModule` files to declare components and register providers. Standalone Angular eliminates that layer — components declare their own imports, and providers are registered in `app.config.ts`. If you see older Angular tutorials using `AppModule`, they are describing the old approach. Your project uses the new approach.

- **`app.config.ts`** — the root configuration for the Angular app. This is where you register the router, `HttpClient`, and interceptors. You do not touch this file often, but everything depends on what is registered here.

- **`jwt.interceptor.ts`** — an Angular HTTP interceptor that runs before every outgoing request. It reads the access token from `AuthService` and attaches it as a `Bearer` header. It also sets `withCredentials: true` so the browser sends the refresh token cookie.

- **`error.interceptor.ts`** — an interceptor that runs after every response. If it sees a `401 Unauthorized`, it attempts to silently refresh the access token and retry the original request. If the refresh fails, it redirects to `/login`. This is what keeps users logged in across token expiry without showing them an error.

- **`core/models/`** — TypeScript interfaces that mirror the API response shapes. These give you full type safety throughout the frontend. Without them, everything is `any` and you lose all IDE help and compile-time error catching.

- **Guards** (`auth.guard.ts`, `guest.guard.ts`, `onboarding.guard.ts`) — functions that run before Angular navigates to a route. `authGuard` blocks unauthenticated users from protected pages. `guestGuard` redirects logged-in users away from login/register pages. `onboardingGuard` redirects new users to the onboarding flow. Create them as stubs that return `true` for now — you will implement the real logic in Phase 1.

**Where to learn the concepts:**

- Angular standalone components: [importing](https://angular.dev/guide/components/importing)
- Angular HTTP interceptors: [interceptors](https://angular.dev/guide/http/interceptors)
- Angular route guards: [route guards](https://angular.dev/guide/routing/common-router-tasks#preventing-unauthorized-access)
- Angular Signals (the state management pattern used in every service): [signals](https://angular.dev/guide/signals)

**Exact patterns and code are in `LevelUp_Angular_Structure.md` sections 4–9.**

**Build order within 0.4:**

1. `src/environments/environment.ts` and `environment.prod.ts` — API URL configuration
2. `src/proxy.conf.json` and wire it into `angular.json` — dev proxy so Angular can talk to Spring Boot
3. `app.config.ts` — register router, HttpClient, and interceptors (pattern in Angular Structure doc section 4)
4. `core/models/` — copy all TypeScript interfaces from `LevelUp_TypeScript_Models.md`
5. `jwt.interceptor.ts` — attach Bearer token to all requests
6. `error.interceptor.ts` — handle 401 with silent refresh
7. Stub guards: `auth.guard.ts`, `guest.guard.ts`, `onboarding.guard.ts` — return `true` for now
8. `NavbarComponent` shell — just the component file with placeholder HTML for now

**Environment file note:** The `apiUrl` in `environment.ts` for development should be `/api/v1` (not `http://localhost:8080/api/v1`). The proxy config translates `/api/...` requests to `http://localhost:8080/api/...` automatically. Using the full URL in the environment file will bypass the proxy and cause CORS errors.

**Checkpoint:** `ng serve` runs with no console errors. The app loads in the browser. The default Angular page or a blank page is fine — no features exist yet.

---

## Phase 1 — Authentication

The first real feature and the foundation of everything else. Every protected feature in the app depends on being able to identify who the user is.

**What you are building:** Register, login, logout, and session restore. The session restore is the trickiest part — when a user refreshes the page, the access token (stored in memory) is gone. The refresh token (stored in an HttpOnly cookie) survives. On startup, the app calls the refresh endpoint to get a new access token from the cookie. This is invisible to the user.

**Key concept — why tokens work this way:**

There are two tokens with different roles:

- **Access token (JWT, 15 min):** Stored in memory (a JavaScript variable). Short-lived because if it leaks, the attacker can only use it for 15 minutes. Never in `localStorage` — JavaScript on the page can read `localStorage`, which makes it vulnerable to XSS attacks.
- **Refresh token (opaque, 2 weeks):** Stored in an HttpOnly cookie. The browser sends it automatically with every request to the server, but JavaScript on the page cannot read it. This is the key security property — even if an attacker runs arbitrary JavaScript on your page, they cannot steal the refresh token.

Recommended reading before building:

-[OAuth](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
-[cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies) (HttpOnly cookie section)

---

### 1.1 Backend — Auth

**What each piece does:**

- `User` entity: your JPA-mapped database table. The `@Entity` annotation tells Hibernate this class maps to a database row. Add the `CREATE TABLE users` SQL to `V1__initial_schema.sql` (the SQL is already there from the initial migration).

- `UserRepository`: a Spring Data JPA interface. You declare method signatures like `findByEmail(String email)` and Spring generates the SQL automatically. You never write `SELECT` statements for simple lookups.

- DTOs (`RegisterRequest`, `LoginRequest`, `AuthResponse`, `UserResponse`): Data Transfer Objects. They are simple POJOs that represent the shape of data coming in and going out of the API. **Never return your `User` entity directly from a controller** — entities contain password hashes and internal fields that should never be exposed.

- `AuthService`: contains all the business logic — password hashing with BCrypt, checking for duplicate emails/usernames, generating JWTs, managing refresh tokens.

- `AuthController`: thin layer that receives HTTP requests, calls `AuthService`, and returns HTTP responses. No business logic lives in controllers.

**Flyway for this phase:** The `users`, `refresh_tokens`, and `password_reset_tokens` tables are already in `V1__initial_schema.sql`. No new migration needed for 1.1.

**Where to learn:**

- Spring Data JPA derived query methods: [JPA](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.query-methods.query-creation)
- Spring Security password encoding: [encoding](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)
- `@Valid` and Bean Validation: [beans](https://www.baeldung.com/spring-boot-bean-validation)

**Pattern reference:** `LevelUp_SpringBoot_Patterns.md` sections 1–5 show the full entity → repository → DTO → service → controller pattern with a worked example.

**Test with Postman or curl before building the Angular side.** Verify register creates a user, login returns a token, the token is rejected for protected endpoints, and logout revokes the refresh token.

**Endpoints to build:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`

Full request/response shapes are in `LevelUp_API_Endpoints.md` section 2.

---

### 1.2 Frontend — Auth

**The session restore sequence is the most important thing to understand here:**

```text
App starts → AppComponent.ngOnInit() → authService.refreshSession()
  → POST /api/v1/auth/refresh (cookie sent automatically by browser)
    → Success: stores new access token in memory, sets initialized = true
    → Failure: token = null, initialized = true (user is logged out)
  → Guards unblock and evaluate auth state
  → User sees correct page
```

If you skip the `initialized` signal, guards will run before the refresh completes and will incorrectly redirect logged-in users to the login page on every page refresh.

**What each piece does:**

- `AuthService`: the frontend service managing auth state. Uses Angular Signals — a `private signal` for the token (only the service can write it), a `computed` signal for `isAuthenticated` (components read this). The signal-based pattern means the UI updates automatically when the token changes, without subscribing to anything.

- `UserService`: holds the current user object. Set after successful login/register/refresh. Read by `onboardingGuard` to check if the user needs onboarding.

- Guards: now implement real logic. `authGuard` reads `initialized` (waits for session restore) then checks `isAuthenticated`. `guestGuard` is the opposite — redirects logged-in users away from login/register. `onboardingGuard` checks if `currentUser.onboardingCompleted` is false.

- Page components (`LoginPageComponent`, `RegisterPageComponent`, etc.): forms that call `AuthService` methods. Use Angular's reactive forms for form state and validation.

**Where to learn:**

- Angular Signals: [signals](https://angular.dev/guide/signals)
- Angular Reactive Forms: [Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- Angular route guards with signals: [route guard](https://angular.dev/guide/routing/common-router-tasks#preventing-unauthorized-access)
- `withComponentInputBinding()` (lets route params become `@Input()` properties): [Inputbinding](https://angular.dev/api/router/withComponentInputBinding)

**Pattern reference:** The full `AuthService` pattern with signals is in `LevelUp_Angular_Structure.md` sections 6–7. The full route setup is in `LevelUp_Frontend_Routing.md`.

**Checkpoint:** You can register an account, log in, and reload the page without being redirected to login. Protected routes redirect to `/login` when unauthenticated. The login page redirects to `/feed` when you are already logged in. You can log out and the session is gone.

---

## Phase 2 — Game Search (IGDB)

Every feature involving games — library, reviews, collections, challenges — depends on being able to find and cache game data. Build this before any of them.

**What IGDB is:** The Internet Game Database (igdb.com), owned by Twitch/Amazon. It provides a free API for game data including titles, cover art, genres, platforms, and summaries. You need a free Twitch developer account to get API credentials.

**Get your IGDB credentials:** Go to [Twitch Dev](https://dev.twitch.tv), log in or create an account, register an application, and copy the Client ID and Client Secret into your `application-dev.properties`.

**The caching strategy:**  
Every game searched through the IGDB API is saved to your local `games` table. When someone searches for the same game again, you return the cached version and also refresh from IGDB in the background (or re-fetch if the cache is older than 30 days). This reduces your API call volume and means game detail pages load fast.

---

### 2.1 Backend — IGDB Integration

**New concept — WebClient:**  
This feature introduces `WebClient`, Spring's non-blocking HTTP client (from the WebFlux library). You use it to call the IGDB API. WebClient is reactive — it returns `Flux` and `Mono` types (from Project Reactor) instead of plain objects. For this project, you call `.block()` to convert from reactive to blocking, which is fine for a simple server-side API call.

**Where to learn:**

- WebClient basics: [basics](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html#webflux-client)
- Spring `@Scheduled` for the token refresh scheduler: [Scheduling Tasks](https://spring.io/guides/gs/scheduling-tasks/)
- IGDB API docs (you will need these to understand the query format): [IGDB](https://api-docs.igdb.com/)

**What to build:**

- `WebClientConfig.java` — configures a `WebClient` bean with the IGDB base URL and required headers
- `IgdbTokenService.java` — calls the Twitch OAuth endpoint to get a Bearer token, stores it in memory, exposes `getValidToken()`. Refreshes automatically when expired.
- `IgdbTokenRefreshScheduler.java` — `@Scheduled` to refresh the IGDB token before it expires (every 55 days, token lasts 60)
- `Game` entity + migration — add to `V1__initial_schema.sql` (or create `V2__add_games.sql` if migration has already been applied)
- `GameRepository`, `GameService`, `GameController`
- DTOs: `GameSummaryResponse`, `GameResponse`

**Pattern reference:** The full `GameService` pattern with IGDB integration and local caching is in `LevelUp_SpringBoot_Patterns.md` section 7. The scheduler pattern is section 8.

**Endpoint:** `GET /api/v1/games/search?q=`, `GET /api/v1/games/{id}` — details in `LevelUp_API_Endpoints.md` section 4.

**Checkpoint:** Postman search for a game returns IGDB results. Searching the same term again returns cached results (verify in a DB client or by watching the SQL logs).

---

### 2.2 Frontend — Game Search

These are **shared components** — they will be reused in the library page, onboarding, collections, and challenge admin. Build them once here, cleanly, and every later phase gets them for free.

**Where to learn:**

- Angular `@Output()` and `EventEmitter`: [outputs](https://angular.dev/guide/components/outputs)
- `debounceTime` in RxJS (prevents a new API call on every keystroke): [debounceTime](https://rxjs.dev/api/operators/debounceTime)
- Angular component `@Input()`: [input component](https://angular.dev/guide/components/inputs)

**What to build:**

- `GameService` in `core/services/` — wraps `searchGames()` and `getGame()` HTTP calls
- `GameSearchInputComponent` in `shared/components/game-search-input/` — a search input with debouncing that calls the API and `@Output()`-emits the selected game
- `GameCardComponent` in `shared/components/game-card/` — displays cover art, title, genres, platforms. Accepts a `GameCardInput` discriminated union (see `LevelUp_TypeScript_Models.md` section 13) so it works in both library context (with status badge) and discovery context (neutral state)

**Checkpoint:** Typing in the game search input triggers API calls and displays results. Selecting a result emits the game object.

---

## Phase 3 — Library

The core feature. This is why the app exists.

**What the library is:** A user's personal record of every game they have tracked. Each entry has a status, an owned flag, optional platforms, and an optional personal rating. Status and owned are independent — someone can be "Owned + Backlog" (they have it but haven't started) or "Not Owned + Played" (borrowed it, finished it, gave it back).

**New concept — `FeedEvent`:**  
You need to build the `FeedEvent` entity now even though the feed page is not until Phase 7. Library status changes are the primary trigger for feed events — the moment you update a status, a feed event is written. The event is what appears in friends' feeds later. If you build the library without the feed event side effects, you will have no historical data when you build the feed.

---

### 3.1 Backend — Library

**Where to learn:**

- Spring Data JPA `Page<T>` and `Pageable`: [docs](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.special-parameters)
- PostgreSQL array types with `hypersistence-utils`: the `@Type(StringArrayType.class)` annotation — see `LevelUp_SpringBoot_Patterns.md` section 1 for the exact usage. Also check the version warning about the `63` suffix in the artifact name.
- Spring `@Enumerated(EnumType.STRING)`: never use `ORDINAL` — if you reorder enum values later, `ORDINAL` silently corrupts your data. `STRING` stores the name.

**What to build:**

- `LibraryStatus` enum
- `LibraryEntry` entity + SQL in migration
- `FeedEventType` enum
- `FeedEvent` entity + SQL in migration
- `LibraryEntryRepository`, `FeedEventRepository`
- DTOs: `CreateLibraryEntryRequest`, `UpdateLibraryEntryRequest`, `LibraryEntryResponse`
- `LibraryService` — add game, update entry, remove game, list with filter/sort/pagination, emit feed events on status changes
- `LibraryController` — full CRUD at `/api/v1/library/**`

**Pattern reference:** The full library feature is the worked example in `LevelUp_SpringBoot_Patterns.md` section 6. The complex filter logic (all combinations of status, owned, platform) is covered in section 2 (repository) and section 4 (service).

**Endpoints:** Full details in `LevelUp_API_Endpoints.md` section 5.

---

### 3.2 Frontend — Library

**Where to learn:**

- Angular Signals with service-driven state: [docs](https://angular.dev/guide/signals)
- `@for` (the modern Angular template loop, replacing `*ngFor`): [docs](https://angular.dev/guide/templates/control-flow)
- Angular `@if` (replacing `*ngIf`): [docs](https://angular.dev/guide/templates/control-flow)

**What to build:**

- `LibraryService` in `core/services/` — wraps all library API calls
- `LibraryPageComponent` — the user's library grid with filter/sort controls
- `LibraryToolbarComponent` — status filter tabs, sort dropdown, search within library
- `LibraryGridComponent` — renders the library entries using `GameCardComponent`
- Shared components to build now (used throughout the app later):
  - `StatusBadgeComponent` — visual chip showing a game's status
  - `StatusPickerComponent` — dropdown for changing status
  - `OwnedToggleComponent` — owned/unowned toggle
  - `RatingStarsComponent` — 1-10 rating input and display
- `GameDetailPageComponent` — game page showing IGDB metadata, user's current library entry, and a section for reviews (empty placeholder for now)
- `UserGameActionsComponent` — the add-to-library / update status / rate UI on the game detail page

**Checkpoint:** You can search for a game, add it to your library with a status, toggle owned, assign a rating, and see your library page populated. Changing a status writes a feed event to the database (check in a DB client — the feed page is not built yet).

---

## Phase 4 — User Profile (Own Profile)

Build the profile page for your own account first. The friend-specific sections (friend library, shared games) come in Phase 6 once friendship is implemented.

**Design principle:** The profile page has three rendering layers controlled by the requesting user's relationship to the profile owner:

1. **Public (anyone):** Avatar, username, bio, stats, public reviews, public collections
2. **Authenticated (logged in, not a friend):** Same as above plus friend request button
3. **Friends only:** Taste profile, library, shared games

---

### 4.1 Backend — Profile

**New concept — Taste Profile:**  
`TasteProfileService` is a computation service — it does not manage its own entity. It reads from `library_entries` and computes genre breakdown and top tags from the games the user has rated or completed. This is the foundation for the "For You" feed recommendations later.

**Where to learn:**

- Spring `@Service` vs `@Component`: [docs](https://www.baeldung.com/spring-component-repository-service)
- JPQL aggregation queries (for counting genres): [docs](https://www.baeldung.com/spring-data-jpa-query)

**What to build:**

- `UserController` — `GET /api/v1/users/{username}` (public profile), `PATCH /api/v1/users/me` (update own profile)
- `TasteProfileService` — computes genre breakdown and top tags
- `TasteProfileResponse` DTO
- `GET /api/v1/users/{username}/taste-profile`

**Endpoints:** `LevelUp_API_Endpoints.md` section 3.

---

### 4.2 Frontend — Profile

**Where to learn:**

- Route parameters as `@Input()` with `withComponentInputBinding()`: [docs](https://angular.dev/api/router/withComponentInputBinding)
- Angular `@if` for conditional rendering: [docs](https://angular.dev/guide/templates/control-flow)

**What to build:**

- `ProfilePageComponent` — reads `:username` from route params, fetches profile and taste profile, renders correct visibility layer
- `ProfileHeaderComponent` — avatar, username, bio, stats
- `TasteProfileComponent` — genre breakdown chart and top tags (for the current user — the "add friend to see" gate comes in Phase 6)
- `RecentActivityComponent` — last N library status changes from feed events
- `CollectionsPreviewComponent` — placeholder for now, real data in Phase 8
- `AvatarComponent` in `shared/components/avatar/`

**Checkpoint:** Navigating to `/profile/yourusername` shows your profile with taste profile data and recent activity.

---

## Phase 5 — Reviews & Comments

The primary content unit of the social layer. Reviews are the thing people share, comment on, and like.

**Key design decision:** A review's rating is not stored on the review — it is read from the author's `library_entry` for that game. This means rating and review are always in sync, and you cannot have a review with a different rating than your library entry.

---

### 5.1 Backend — Reviews & Comments

**New concept — `@ManyToMany` relationships:**  
Likes (review likes, comment likes) are a many-to-many relationship between users and reviews/comments. You model them as separate join entities (`ReviewLike`, `CommentLike`) rather than using `@ManyToMany` directly — this gives you createdAt timestamps and the ability to query them easily.

**Where to learn:**

- JPA relationships: [docs](https://www.baeldung.com/jpa-many-to-many)
- Why to avoid `@ManyToMany` directly: [docs](https://vladmihalcea.com/the-best-way-to-use-the-manytomany-annotation-with-jpa-and-hibernate/)

**What to build:**

- Entities: `Review`, `ReviewComment`, `ReviewLike`, `CommentLike`
- SQL migrations for all four tables
- Repositories for all four
- DTOs: `CreateReviewRequest`, `UpdateReviewRequest`, `CreateCommentRequest`, `ReviewResponse`, `CommentResponse`
- `ReviewService` — create/update/delete review (emits feed event), like/unlike review, get reviews for a game, get user's reviews
- `CommentService` — add/delete comment, like/unlike comment
- `ReviewController` and `CommentController`

**Endpoints:** `LevelUp_API_Endpoints.md` sections 6 and 7.

---

### 5.2 Frontend — Reviews & Comments

**Where to learn:**

- Angular reactive forms for the review text editor: [docs](https://angular.dev/guide/forms/reactive-forms)
- Optimistic UI updates (update the like count immediately, roll back on error): [docs](https://angular.dev/guide/http/making-requests#error-handling)

**What to build:**

- `ReviewService` and `CommentService` in `core/services/`
- `ReviewCardComponent` in `shared/components/review-card/` — compact review used in feeds and on game pages
- `GameReviewsComponent` — the reviews section on the game detail page
- `ReviewDetailPageComponent` — `/reviews/:id` — full review with comments
- `ReviewBodyComponent` — review text with author rating
- `ReviewCommentsComponent` — comment list and reply form
- Update `ProfilePageComponent` — add a user reviews section

**Checkpoint:** You can write a review from a game's detail page. The review appears on the game page. Navigating to `/reviews/:id` shows the full review with a working comment section. Liking a review or comment updates the count.

---

## Phase 6 — Friends

The social backbone. Feed visibility, shared library, and profile visibility are all gated on friendship.

**The dual-row model:** When User A and User B are friends, there are two rows in the `friendships` table — one for A→B and one for B→A. This makes querying "get all my friends" simple: `SELECT * FROM friendships WHERE user_id = me`. Without the dual-row model, you need complex OR queries with UNION.

---

### 6.1 Backend — Friends

**Where to learn:**

- Designing friendship systems: [docs](https://www.vertabelo.com/blog/friendship-in-social-apps-using-a-database-model/)
- Spring Security `@PreAuthorize` (alternative to manual ownership checks — worth knowing exists): [docs](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html)

**What to build:**

- `FriendRequest` entity + migration
- `Friendship` entity + migration — dual-row model
- Repositories for both
- DTOs: `SendFriendRequestRequest`, `RespondToFriendRequestRequest`, `FriendshipResponse`
- `FriendService` — send request, accept/decline, check status, list friends, list pending requests, remove friend
- `FriendController`
- Update `UserController` — add `GET /api/v1/users/search?q=username`

**Endpoints:** `LevelUp_API_Endpoints.md` section 8.

---

### 6.2 Frontend — Friends

**Where to learn:**

- Angular conditional rendering with `@if`: [docs](https://angular.dev/guide/templates/control-flow)
- Signal-derived state with `computed()`: [docs](https://angular.dev/guide/signals#computed-signals)

**What to build:**

- `FriendService` in `core/services/`
- `FriendsPageComponent` — three sections: friend list, pending requests, find friends
- `FriendListComponent`, `PendingRequestsComponent`, `FindFriendsComponent`
- `UserCardComponent` in `shared/components/user-card/`
- Update `ProfilePageComponent` — now that friendship can be checked, render the three visibility layers correctly
- `FriendLibraryComponent` inside `features/profile/profile-page/` — visible only when `isFriend === true`
- `SharedGamesComponent` inside `features/profile/profile-page/` — visible only when `isFriend === true`
- `FriendRatingsComponent` on the game detail page — friends' ratings for that game

**Checkpoint:** You can search for another user, send a friend request, accept it from another account, and see the full profile including library and shared games.

---

## Phase 7 — Feed & Landing Page

The home screen and the main retention loop.

**The feed is not real-time:** Friend activity is pulled on page load and cached for the session. A user completing a challenge or changing a status does not push to friends' feeds immediately — friends see it the next time they load the feed. This is a deliberate simplification for V1. Real-time would require WebSockets or Server-Sent Events.

---

### 7.1 Backend — Feed

**Where to learn:**

- Spring `@Scheduled` (used for the cleanup job): [docs](https://spring.io/guides/gs/scheduling-tasks/)
- JPQL pagination and sorting: [docs](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.special-parameters)

**What to build:**

- `FeedService` — friends feed (paginated activity from friends, sorted by recency), trending feed (most logged/rated in last 7 days)
- `FeedController` — `GET /api/v1/feed`, `GET /api/v1/discover/trending`
- `FeedEventCleanupScheduler` — deletes feed events older than 90 days
- `FeedEventResponse` DTO

**Endpoints:** `LevelUp_API_Endpoints.md` section 9.

---

### 7.2 Frontend — Feed & Landing

**Where to learn:**

- Angular `@defer` for lazy-loading feed sections: [docs](https://angular.dev/guide/templates/defer)
- Infinite scroll pattern (loading more pages as you scroll): [docs](https://angular.dev/guide/http/making-requests)

**What to build:**

- `FeedService` in `core/services/`
- `FeedPageComponent` — logged-in home screen at `/feed`
- `FeedViewSwitcherComponent` — tabs for Trending / Friends / For You / Similar / New & Notable
- `FriendsFeedComponent`, `TrendingFeedComponent`
- `FeedItemComponent` in `shared/components/feed-item/` — renders a single feed event
- Revisit `LandingPageComponent` — build it properly with the trending endpoint and community activity
- `ToastComponent` in `shared/components/toast/` and `ToastService` — surface confirmations and errors

**Checkpoint:** `/feed` shows real friends feed activity and trending games. The landing page at `/` shows trending content for logged-out visitors.

---

## Phase 8 — Collections

Self-contained and relatively straightforward. No hard dependencies beyond library and auth.

**What collections are:** User-curated lists of games. Examples: "Games to play with my brother", "Best JRPGs", "Completed 2025". Collections can be public or private.

---

### 8.1 Backend — Collections

**Where to learn:**

- `VisibilityType` enum and visibility filtering: same pattern as any other enum-filtered query in `LevelUp_SpringBoot_Patterns.md` section 2.

**What to build:**

- `Collection` entity + migration
- `CollectionEntry` entity + migration
- `VisibilityType` enum
- Repositories for both
- DTOs: `CreateCollectionRequest`, `UpdateCollectionRequest`, `AddGameToCollectionRequest`, `CollectionResponse`, `CollectionSummaryResponse`
- `CollectionService` — create, update, delete; add/remove game; visibility toggle
- `CollectionController`

**Endpoints:** `LevelUp_API_Endpoints.md` section 11.

---

### 8.2 Frontend — Collections

**What to build:**

- `CollectionService` in `core/services/`
- `CollectionDetailPageComponent` at `/collections/:id`
- `CollectionHeaderComponent`, `CollectionGridComponent`
- Update `ProfilePageComponent` — `CollectionsPreviewComponent` now shows real data
- Add "Add to Collection" action to the game detail page

**Checkpoint:** You can create a collection, add games to it, make it public, and view it at `/collections/:id`.

---

## Phase 9 — Discovery Feeds

Completes the feed page. Depends on having a populated library and taste profile.

**What each feed is:**

- **For You:** Genre-weighted recommendations from games not in your library, boosted by what friends are playing
- **Similar:** Games that share genres/tags with the games you rated highly
- **New & Notable:** Recently released games that have community activity on the platform

---

### 9.1 Backend — Discovery

**Where to learn:**

- JPQL aggregate queries for weighted recommendations: [docs](https://www.baeldung.com/spring-data-jpa-query)
- The `TasteProfileService` you built in Phase 4 is the input here — `DiscoveryService` reads from it

**What to build:**

- `DiscoveryService` — For You, Similar, New & Notable algorithms
- `DiscoveryController` — `/api/v1/discover/**`

---

### 9.2 Frontend — Discovery

**What to build:**

- `DiscoveryService` in `core/services/`
- `ForYouFeedComponent`, `SimilarFeedComponent`, `NewNotableFeedComponent`
- Wire all feed tabs into `FeedViewSwitcherComponent`

**Checkpoint:** All five feed tabs (Trending, Friends, For You, Similar, New & Notable) work and show real data.

---

## Phase 10 — What to Play Next

Self-contained conversational feature. Depends on library and IGDB being complete.

**The experience:** The user answers 4–5 conversational questions (platform? mood? time available? solo or multiplayer?) and gets a ranked shortlist of 3–5 games from their backlog or owned-but-unplayed library, with a plain-English explanation for each suggestion.

**Where to learn:**

- Angular reactive forms for the step-by-step prompt flow: [docs](https://angular.dev/guide/forms/reactive-forms)
- Service layer query composition for multi-filter recommendations — same pattern as library filter logic in `LevelUp_SpringBoot_Patterns.md` section 4

---

### 10.1 Backend

- `WhatToPlayRequest`, `WhatToPlayResponse` DTOs
- `WhatToPlayService` — filters backlog/owned games by platform and mood, ranks and returns shortlist with explanations
- `WhatToPlayController` — `POST /api/v1/what-to-play`

**Endpoint:** `LevelUp_API_Endpoints.md` section 12.

---

### 10.2 Frontend

- `WhatToPlayPageComponent` at `/what-to-play`
- `PromptStepComponent` — one question at a time, conversational flow
- `SuggestionsResultComponent` — 3–5 game suggestions with human-readable explanations

**Checkpoint:** The prompt flow returns a ranked shortlist from the user's actual backlog.

---

## Phase 11 — Daily Challenge

The most complex feature. Save it for when the rest of the app is solid.

**What it is:** A daily game-knowledge puzzle — four rounds of "odd one out" (three games share a common category, one doesn't — identify the outlier), followed by a phase-2 pattern guess. One challenge per day, shared across all users. Friends can compare scores after they have both completed that day's challenge.

**Why it is last:** It has a scheduler generating content, friend-comparison social features, and a puzzle format that depends on having a populated game cache. All of that must exist first.

---

### 11.1 Backend — Daily Challenge

**New concept — `@Scheduled` with `cron`:**  
The challenge generator runs every day at midnight UTC using a cron expression. Unlike `fixedRate` (which counts milliseconds between runs), `cron` runs at exact calendar times regardless of when the server started.

**Where to learn:**

- Spring cron expressions: [docs](https://spring.io/guides/gs/scheduling-tasks/)
- Cron expression syntax (a good visual tool): [docs](https://crontab.guru/)

**What to build:**

- `DailyChallenge` entity + migration — date, rounds (stored as JSONB), categories
- `DailyChallengeResult` entity + migration — user, date, score, accuracy, completion time
- Repositories for both
- `DailyChallengeScheduler` — generates one challenge per day at midnight UTC from the game cache
- DTOs: `ChallengeResponse`, `ChallengeResultResponse`
- `ChallengeService` — get today's challenge (no answers revealed), submit result, get friend scores
- `ChallengeController`
- Update `TasteProfileService` to factor in challenge results as a signal

**Endpoint:** `LevelUp_API_Endpoints.md` section 13.

---

### 11.2 Frontend — Daily Challenge

**What to build:**

- `ChallengeService` in `core/services/`
- `ChallengePageComponent` at `/challenge`
- `ChallengeActiveComponent` — the puzzle UI with four rounds and a phase-2 pattern guess
- `ChallengeResultComponent` — score reveal and shareable text snippet
- `FriendScoresComponent` — visible only after the user completes the challenge
- Update `ProfilePageComponent` — add `ChallengeHistoryComponent` with streak, longest streak, and a calendar heatmap

**Checkpoint:** A challenge exists for today. You can complete it, see a score reveal, view friend scores, and see your streak on your profile.

---

## Phase 12 — Onboarding, Settings & Polish

Do not do this until the core features are working. Onboarding feels premature to build before there is something to onboard users into.

---

### 12.1 Backend — Settings

**What to build:**

- `GameProfile` entity + migration — user's linked gaming platform handles (PSN, Xbox, Steam)
- `GameProfileRepository`
- DTOs: `UpdateSettingsRequest`, `DeleteAccountRequest`, `CreateGameProfileRequest`
- `SettingsController` — `PATCH /api/v1/settings`, `DELETE /api/v1/settings/account`
- `AccountPurgeScheduler` — permanently deletes soft-deleted accounts 30 days after deletion

---

### 12.2 Frontend — Onboarding

**What onboarding guards are for:**  
`onboardingGuard` checks `currentUser.onboardingCompleted`. If false, it redirects the user to `/onboarding` before they can access any protected route. Once they complete onboarding, the server sets `onboardingCompleted = true` on the user and the guard stops firing.

**What to build:**

- `OnboardingPageComponent` — multi-step flow for new users
- `OnboardingSearchStepComponent` — lets users add games they've played using `GameSearchInputComponent`
- `OnboardingPrefsStepComponent` — genre preferences to seed the taste profile
- Wire `onboardingGuard` with real logic

---

### 12.3 Frontend — Settings

**What to build:**

- `SettingsPageComponent` at `/settings`
- `AccountSettingsComponent` — update username, email, bio, avatar
- `PrivacySettingsComponent` — profile visibility defaults
- `GameProfilesComponent` — link/unlink PSN, Xbox, Steam handles
- `DangerZoneComponent` — account deletion with confirmation

---

### 12.4 Shared Polish

These components improve every page in the app. Build them last so you know exactly what states every page needs to handle.

**What to build:**

- `LoadingSkeletonComponent` — placeholder UI while async data loads (prevents layout shift)
- `EmptyStateComponent` — for empty libraries, no friends, no results
- `ConfirmDialogComponent` — for destructive actions (account deletion, removing from library)
- `TimeAgoPipe`, `TruncatePipe`, `StatusLabelPipe` — wire these everywhere they're used
- `NotFoundPageComponent` at `/not-found` with a wildcard catch-all route

**Where to learn:**

- Angular Pipes: [docs](https://angular.dev/guide/templates/pipes)
- Angular `@defer` for loading states: [docs](https://angular.dev/guide/templates/defer)

**Checkpoint:** New users go through onboarding. Existing users can update settings and delete their account. Every page handles loading and empty states gracefully.

---

## Phase 13 — Production Deployment

Do this when you are satisfied the app works end-to-end locally. Deployment is a separate skill from building — give yourself a fresh session for it.

---

### Backend — Railway

**What Railway is:** A platform-as-a-service that runs your Docker/Spring Boot app and provides a managed PostgreSQL database. Simpler than AWS for a portfolio project.

- Create a Railway account at [railway](https://railway.app)
- Create a new project → Add service → GitHub repo (connect your backend repo)
- Add a PostgreSQL service — Railway provisions one automatically
- Set environment variables in Railway: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `SPRING_PROFILES_ACTIVE=prod`
- Flyway runs automatically on startup and applies your migrations to the Railway PostgreSQL database
- Confirm `spring.jpa.hibernate.ddl-auto=validate` is set for the `prod` profile

**Where to learn:** [railway get started](https://docs.railway.app/getting-started)

---

### Frontend — Vercel

**What Vercel is:** A hosting platform optimised for frontend frameworks. Free tier is generous. Angular SPA deployment requires one configuration tweak to handle client-side routing.

- Create a Vercel account at [Vercel](https://vercel.com)
- Connect the Angular repo from GitHub
- Build command: `ng build --configuration production`
- Output directory: `dist/levelup/browser`
- Update `environment.prod.ts` with your Railway backend URL before deploying
- Add a `vercel.json` at the Angular project root to redirect all routes to `index.html` (required for Angular's client-side router — without this, refreshing on any page other than `/` returns a 404):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Where to learn:** [vercel Angular](https://vercel.com/docs/frameworks/angular)
**Checkpoint:** The app is live. Register an account in production, add a game, complete a challenge, verify the scheduler is running.

---

## Build order summary

```text
Phase 0  — Project Foundation (infrastructure only, no features)
Phase 1  — Authentication (register, login, logout, session restore)
Phase 2  — Game Search / IGDB integration
Phase 3  — Library (add games, status, owned, rating)
Phase 4  — User Profile (own profile, taste profile)
Phase 5  — Reviews & Comments
Phase 6  — Friends (requests, shared library, friend profile sections)
Phase 7  — Feed & Landing Page (friends feed, trending, landing page)
Phase 8  — Collections
Phase 9  — Discovery Feeds (For You, Similar, New & Notable)
Phase 10 — What to Play Next
Phase 11 — Daily Challenge
Phase 12 — Onboarding, Settings & Polish
Phase 13 — Production Deployment
```

---

## Reference quick-links

| What you need | Where to find it |
| --- | --- |
| Tool setup, Docker, project generation | `LevelUp_Getting_Started.md` |
| Spring Boot package structure, pom.xml, config classes | `LevelUp_SpringBoot_Structure.md` |
| Entity / Repository / Service / Controller code patterns | `LevelUp_SpringBoot_Patterns.md` |
| Angular folder structure, signals pattern, interceptors | `LevelUp_Angular_Structure.md` |
| TypeScript interfaces and enums | `LevelUp_TypeScript_Models.md` |
| Every API endpoint with request/response shapes | `LevelUp_API_Endpoints.md` |
| Angular routes and guards | `LevelUp_Frontend_Routing.md` |
| Feature descriptions, user stories, data model ERD | `LevelUp_Design_Document.md` |

---

LevelUp — Development Plan — v2.0
