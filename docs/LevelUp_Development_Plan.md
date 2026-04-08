# LevelUp — Development Plan

**Version:** 1.0  
**Last updated:** 2026-04-08

---

## How to read this document

Each phase is a vertical slice — you build the backend API and the Angular UI for that feature together before moving on. This keeps the app in a working state throughout development and lets you see real progress rather than having a complete backend with nothing to show for it.

**The rule for every feature:**
1. Write the Flyway migration SQL for any new tables
2. Build the Spring Boot side (entity → repository → service → controller → DTOs)
3. Build the Angular side (service → component → routing)
4. Test end-to-end before moving on

Do not skip ahead. Later phases have hard dependencies on earlier ones.

---

## Phase 0 — Project Foundation

This phase produces no visible features. It is the skeleton everything else attaches to. Get it right once and do not revisit it.

### 0.1 Repository & project structure

- Create the parent folder (`~/projects/levelup/`)
- Create two git repos: one for `levelup-api/`, one for `levelup/`
- Generate the Spring Boot project from start.spring.io (settings in the Getting Started guide)
- Generate the Angular project with `ng new levelup --standalone --routing --style=scss --no-ssr`
- Add all `.gitignore` entries immediately — especially `application-dev.properties`

### 0.2 Docker and database

- Create `docker-compose.yml` in the parent folder
- Start the database and confirm `docker ps` shows it running
- Create `src/main/resources/db/migration/` directory in the Spring Boot project
- Create `V1__initial_schema.sql` — leave it empty for now, you will add to it as you build entities

### 0.3 Spring Boot infrastructure

This is the wiring that every subsequent backend feature depends on. Build all of it before touching any domain code.

- Add all `pom.xml` dependencies (JWT, WebFlux, Hypersistence, Flyway, Security test)
- Write `application.properties` and `application-dev.properties`
- `SecurityConfig.java` — filter chain, BCrypt bean, public vs protected endpoint rules
- `CorsConfig.java` — allow `http://localhost:4200`
- `JwtUtil.java` — generate and validate access + refresh tokens
- `JwtAuthFilter.java` — intercepts requests and validates Bearer token
- `UserDetailsServiceImpl.java` — loads user by email
- `RefreshTokenService.java` — manages refresh token lifecycle
- `GlobalExceptionHandler.java` — `@RestControllerAdvice` for consistent error shapes
- Custom exception classes: `ResourceNotFoundException`, `ConflictException`, `ForbiddenException`

**Checkpoint:** Spring Boot starts without errors. No domain features exist yet — that is fine.

### 0.4 Angular infrastructure

Build all the wiring Angular needs before any feature component exists.

- Configure `app.config.ts` — register router, HttpClient, and interceptors
- Configure `src/proxy.conf.json` and wire it into `angular.json`
- Create `src/environments/environment.ts` and `environment.prod.ts`
- Write `jwt.interceptor.ts` — attach Bearer token and `withCredentials` to all requests
- Write `error.interceptor.ts` — handle 401 with silent token refresh, redirect on failure
- Create the `core/models/` files — all TypeScript interfaces from `LevelUp_TypeScript_Models.md`
- Create stub files for `auth.guard.ts`, `guest.guard.ts`, `onboarding.guard.ts` — they can return `true` for now
- Create the `NavbarComponent` shell in `shared/components/navbar/`

**Checkpoint:** `ng serve` runs, the app loads, no console errors.

---

## Phase 1 — Authentication

The first real feature. Everything in the app is gated behind this.

### 1.1 Backend — Auth

- `User` entity + `V1__initial_schema.sql` entry for the `users` table
- `UserRepository` interface
- `RegisterRequest`, `LoginRequest` DTOs
- `AuthResponse`, `UserResponse` DTOs
- `AuthService` — register, login, logout, refresh
- `AuthController` — `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/refresh`
- `RefreshToken` entity + table migration + `RefreshTokenRepository`
- `PasswordResetToken` entity + table migration + `PasswordResetTokenRepository`
- `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` endpoints

Test with Postman or curl before building any UI.

### 1.2 Frontend — Auth

- `AuthService` — full implementation (login, register, logout, refreshSession, getToken, isAuthenticated signal, initialized signal)
- `AppComponent.ngOnInit()` — calls `refreshSession()` on startup
- `UserService` — `currentUser` signal, `setCurrentUser()` method
- Wire `authGuard`, `guestGuard`, `onboardingGuard` to actual auth logic
- `app.routes.ts` — set up all auth routes with guards
- `LandingPageComponent` — public home page (placeholder design for now, you will revisit in Phase 7)
- `LoginPageComponent` — email + password form, calls `AuthService.login()`
- `RegisterPageComponent` — registration form, calls `AuthService.register()`
- `ForgotPasswordPageComponent` — email submission form
- `NavbarComponent` — logged-in vs logged-out states, logout button

**Checkpoint:** You can register, log in, have your session persist across page reloads (via the refresh token cookie), and log out. Protected routes redirect to login. Logged-in users hitting `/login` redirect to `/feed` (which can be a blank page for now).

---

## Phase 2 — Game Search (IGDB)

Every feature that involves games — library, reviews, collections, challenges — depends on being able to find and cache game data. Build this before any of them.

### 2.1 Backend — IGDB Integration

- `WebClientConfig.java` — configure WebClient for IGDB base URL and headers
- `IgdbTokenService.java` — exchange Twitch credentials for a Bearer token, store in memory, expose a `getToken()` method
- `IgdbTokenRefreshScheduler.java` — `@Scheduled` to refresh the token before it expires
- `Game` entity + migration — IGDB id, title, cover URL, genres (array), platforms (array), release date, summary, cached timestamp
- `GameRepository` interface
- `GameService` — `searchGames(query)` searches IGDB, merges with local cache, upserts results; `getGameById(id)` checks local cache first, fetches from IGDB on miss, re-fetches if cached record is older than 30 days
- `GameSummaryResponse`, `GameResponse` DTOs
- `GameController` — `GET /api/v1/games/search?q=`, `GET /api/v1/games/{id}`

Test in Postman: search for a game, see IGDB results come back. Search for the same game again and confirm it hits the local cache.

### 2.2 Frontend — Game Search

- `GameService` in `core/services/` — `searchGames()`, `getGame()`
- `GameSearchInputComponent` in `shared/components/game-search-input/` — debounced search input that calls the API and emits a selected game
- `GameCardComponent` in `shared/components/game-card/` — displays cover art, title, and basic metadata

These are shared components used in the library, onboarding, collections, and challenge admin. Build them once here.

**Checkpoint:** The game search input works. Typing a query returns results from IGDB. Clicking a result returns the game object.

---

## Phase 3 — Library

The core product feature. This is the reason the app exists.

### 3.1 Backend — Library

- `LibraryEntry` entity + migration — user, game, status enum, owned flag, platforms (array), personal rating, dates
- `LibraryStatus` enum
- `LibraryEntryRepository`
- `FeedEvent` entity + migration — you need this now because library status changes generate feed events
- `FeedEventType` enum
- `FeedEventRepository`
- `CreateLibraryEntryRequest`, `UpdateLibraryEntryRequest` DTOs
- `LibraryEntryResponse` DTO
- `LibraryService` — add game, update status/rating/owned/platforms, remove game, get user's library with filter/sort/pagination, emit feed events on status changes
- `LibraryController` — full CRUD for `/api/v1/library/**`

### 3.2 Frontend — Library

- `LibraryService` in `core/services/` — wraps all library API calls
- `LibraryPageComponent` — paginated grid of the user's library with filter and sort controls
- `LibraryToolbarComponent` — status filter tabs, sort dropdown, search within library
- `LibraryGridComponent` — renders game cards in a grid
- `StatusBadgeComponent` in `shared/components/status-badge/` — visual indicator for each status
- `StatusPickerComponent` in `shared/components/status-picker/` — dropdown for changing a game's status
- `OwnedToggleComponent` in `shared/components/owned-toggle/` — toggle for the owned flag
- `RatingStarsComponent` in `shared/components/rating-stars/` — 1-10 rating input and display
- `GameDetailPageComponent` — game page showing IGDB metadata, the user's current library entry (status, rating, owned), and a section for reviews
- `UserGameActionsComponent` — the add-to-library / update status / rate UI that lives on the game detail page

**Checkpoint:** You can search for a game, add it to your library, set a status, toggle owned, assign a rating, and see your library page populated. Changing a status creates a feed event in the database (verify in a DB client — the feed page is not built yet).

---

## Phase 4 — User Profile (Own Profile)

Build the profile page for your own account first. Friend-specific sections come in Phase 6.

### 4.1 Backend — Profile

- `UserController` — `GET /api/v1/users/{username}` (public profile), `PATCH /api/v1/users/me` (update own profile)
- `TasteProfileService` — computes genre breakdown and top tags from the user's rated/completed library entries
- `TasteProfileResponse` DTO
- `GET /api/v1/users/{username}/taste-profile`

### 4.2 Frontend — Profile

- `ProfilePageComponent` — `/profile/:username` route, three rendering layers (public / authenticated / friends-only)
- `ProfileHeaderComponent` — avatar, username, bio, stats (library count, completed count)
- `TasteProfileComponent` — genre breakdown and top tags display (friends-only section for now — use a placeholder "add this person to see their taste profile")
- `RecentActivityComponent` — last N library status changes from the feed events table
- `CollectionsPreviewComponent` — placeholder for now, will populate in Phase 8
- `AvatarComponent` in `shared/components/avatar/`

**Checkpoint:** Navigating to `/profile/yourusername` shows your profile with your taste profile data and recent activity.

---

## Phase 5 — Reviews & Comments

The primary content unit of the social layer.

### 5.1 Backend — Reviews & Comments

- `Review` entity + migration
- `ReviewComment` entity + migration
- `ReviewLike` entity + migration
- `CommentLike` entity + migration
- `ReviewRepository`, `ReviewCommentRepository`, `ReviewLikeRepository`, `CommentLikeRepository`
- `CreateReviewRequest`, `UpdateReviewRequest`, `CreateCommentRequest` DTOs
- `ReviewResponse`, `CommentResponse` DTOs — `ReviewResponse` includes the author's rating from their library entry
- `ReviewService` — create/update/delete review (emits feed event), like/unlike review, get reviews for a game, get user's reviews
- `CommentService` — add/delete comment, like/unlike comment
- `ReviewController` — `/api/v1/games/{id}/reviews`, `/api/v1/reviews/**`
- `CommentController` — `/api/v1/reviews/{id}/comments`, `/api/v1/comments/**`

### 5.2 Frontend — Reviews & Comments

- `ReviewService` and `CommentService` in `core/services/`
- `ReviewCardComponent` in `shared/components/review-card/` — compact review display used in feeds and on game pages
- `GameReviewsComponent` — the reviews section on the game detail page, sorted friends-first then recency
- `ReviewDetailPageComponent` — `/reviews/:id` — full review with comments section
- `ReviewBodyComponent` — renders review text with the author's rating
- `ReviewCommentsComponent` — comment list and reply form
- `UserReviewsSection` on the profile page — the user's own reviews

**Checkpoint:** You can write a review from a game's detail page. The review appears on the game page. Navigating to `/reviews/:id` shows the full review with a working comment section. Liking a review or comment updates the count.

---

## Phase 6 — Friends

The social backbone. Many features — feed, shared library, profile visibility — are not complete until this is done.

### 6.1 Backend — Friends

- `FriendRequest` entity + migration
- `Friendship` entity + migration — dual-row model (one row per direction when accepted)
- `FriendRequestRepository`, `FriendshipRepository`
- `SendFriendRequestRequest`, `RespondToFriendRequestRequest` DTOs
- `FriendshipResponse` DTO
- `FriendService` — send request, accept/decline, check friendship status between two users, get friend list, get pending requests, remove friend
- `FriendController` — `/api/v1/friends/**`
- Update `UserController` to support `GET /api/v1/users/search?q=username` for finding users

### 6.2 Frontend — Friends

- `FriendService` in `core/services/`
- `FriendsPageComponent` — three sub-sections: friend list, pending requests, find friends
- `FriendListComponent` — cards linking to `/profile/:username`
- `PendingRequestsComponent` — incoming requests with accept/decline actions
- `FindFriendsComponent` — search by username using the user search endpoint
- `UserCardComponent` in `shared/components/user-card/` — used on the friends page and elsewhere
- Update `ProfilePageComponent` — now that friendship can be checked, render the authenticated-only and friends-only sections correctly
- `FriendLibraryComponent` inside `features/profile/profile-page/` — visible only when `isFriend === true` — shows the friend's library with filter controls
- `SharedGamesComponent` inside `features/profile/profile-page/` — visible only when `isFriend === true` — games both users own
- `FriendRatingsComponent` on the game detail page — shows friends' ratings for that game

**Checkpoint:** You can search for another user, send them a friend request, accept it from the other account, and see their full profile including their library and your shared games.

---

## Phase 7 — Feed & Landing Page

The home screen and the main loop that keeps users returning.

### 7.1 Backend — Feed

- `FeedService` — friends feed (activity from friends, paginated), trending feed (most logged/rated games platform-wide, last 7 days)
- `FeedController` — `GET /api/v1/feed` (friends feed), `GET /api/v1/discover/trending`
- `FeedEventCleanupScheduler` — deletes feed events older than 90 days
- `FeedEventResponse` DTO

### 7.2 Frontend — Feed & Landing

- `FeedService` in `core/services/`
- `FeedPageComponent` — the logged-in home screen at `/feed`
- `FeedViewSwitcherComponent` — tabs for Trending / Friends / For You / Similar / New & Notable
- `FriendsFeedComponent` — renders paginated friend activity events
- `TrendingFeedComponent` — trending games section
- `FeedItemComponent` in `shared/components/feed-item/` — renders a single feed event (status change, review posted, etc.)
- Revisit `LandingPageComponent` — now build it properly with the trending endpoint and community activity surface. This is the acquisition page.
- `ToastComponent` in `shared/components/toast/` and `ToastService` — surface confirmations and errors across the app. Add it here because the feed interactions need it.

**Checkpoint:** The `/feed` route shows a real friends feed and a trending section. The landing page at `/` shows trending games and community activity for logged-out visitors.

---

## Phase 8 — Collections

A lighter lift. Collections are self-contained and have no hard dependencies beyond library and auth.

### 8.1 Backend — Collections

- `Collection` entity + migration
- `CollectionEntry` entity + migration
- `VisibilityType` enum
- `CollectionRepository`, `CollectionEntryRepository`
- `CreateCollectionRequest`, `UpdateCollectionRequest`, `AddGameToCollectionRequest` DTOs
- `CollectionResponse`, `CollectionSummaryResponse` DTOs
- `CollectionService` — create, update, delete collection; add/remove game; visibility toggle
- `CollectionController` — `/api/v1/collections/**`, `/api/v1/users/{username}/collections`

### 8.2 Frontend — Collections

- `CollectionService` in `core/services/`
- `CollectionDetailPageComponent` — `/collections/:id`
- `CollectionHeaderComponent` — name, description, game count, visibility toggle, share link
- `CollectionGridComponent` — game grid inside a collection
- Update `ProfilePageComponent` — `CollectionsPreviewComponent` now shows real data
- Add "Add to Collection" action to the game detail page

**Checkpoint:** You can create a collection, add games to it, make it public, and view it at `/collections/:id`.

---

## Phase 9 — Discovery Feeds

Completes the feed page. Depends on having a populated library and taste profile.

### 9.1 Backend — Discovery

- `DiscoveryService` — For You (genre-weighted, excludes owned, boosted by friend activity); Similar (genre/tag match to highly-rated games); New & Notable (recent releases with community activity)
- `DiscoveryController` — `/api/v1/discover/**`

### 9.2 Frontend — Discovery

- `DiscoveryService` in `core/services/`
- `ForYouFeedComponent` — personalised recommendations
- `SimilarFeedComponent` — games similar to highly-rated entries in your library
- `NewNotableFeedComponent` — recently released games with community activity
- Wire all four tab views into `FeedViewSwitcherComponent` so the full feed page is complete

**Checkpoint:** All five feed views (Trending, Friends, For You, Similar, New & Notable) work. The tab switcher toggles between them.

---

## Phase 10 — What to Play Next

Self-contained conversational feature. Depends on the library and IGDB integration being complete.

### 10.1 Backend — What to Play Next

- `WhatToPlayRequest` DTO — platform, time available, mood, multiplayer/solo, include played, include new
- `WhatToPlayResponse` DTO — list of suggestions with explanation strings
- `WhatToPlayService` — queries the user's backlog and owned-but-unplayed games, filters by platform/mood, optionally supplements with IGDB suggestions; returns ranked shortlist with human-readable explanations
- `WhatToPlayController` — `POST /api/v1/what-to-play`

### 10.2 Frontend — What to Play Next

- `WhatToPlayPageComponent` — `/what-to-play`
- `PromptStepComponent` — conversational prompt flow, one question at a time
- `SuggestionsResultComponent` — displays 3-5 ranked game suggestions with explanation for each

**Checkpoint:** Answering the conversational prompts returns a ranked shortlist of games from your backlog or library. The explanations reference real library data ("Because you rated Red Dead Redemption 2 a 9 and haven't finished your backlog of open-world games").

---

## Phase 11 — Daily Challenge

The most complex feature. Save it for when the rest of the app is solid.

### 11.1 Backend — Daily Challenge

- `DailyChallenge` entity + migration — date, four rounds (each with four game IDs and the odd-one-out answer), phase 2 pattern answer, categories
- `DailyChallengeResult` entity + migration — user, date, score, accuracy, completion time
- `DailyChallengeRepository`, `DailyChallengeResultRepository`
- `DailyChallengeScheduler` — `@Scheduled` at midnight UTC, generates one challenge per day by selecting games and groupings from the local game cache
- `ChallengeResponse`, `ChallengeResultResponse` DTOs
- `ChallengeService` — get today's challenge (without revealing answers), submit a result, get friend scores for a date
- `ChallengeController` — `/api/v1/challenge/**`
- Update `TasteProfileService` to ingest challenge results as a signal

### 11.2 Frontend — Daily Challenge

- `ChallengeService` in `core/services/`
- `ChallengePageComponent` — `/challenge`
- `ChallengeActiveComponent` — the four-round puzzle UI with the phase 2 pattern guess
- `ChallengeResultComponent` — score reveal, shareable text snippet generation
- `FriendScoresComponent` — today's friend scores, visible only after the user completes that day's challenge
- Update `ProfilePageComponent` — `ChallengeHistoryComponent` with streak, longest streak, and calendar heatmap

**Checkpoint:** A challenge exists for today. You can complete it, see a score reveal, view friend scores, and see your streak on your profile.

---

## Phase 12 — Onboarding, Settings & Polish

The finishing pass. Do not do this until the core features are working.

### 12.1 Backend — Settings

- `UpdateSettingsRequest`, `DeleteAccountRequest`, `CreateGameProfileRequest` DTOs
- `GameProfile` entity + migration — user, platform name, platform username
- `GameProfileRepository`
- `SettingsController` — `PATCH /api/v1/settings`, `DELETE /api/v1/settings/account`
- `AccountPurgeScheduler` — permanently deletes soft-deleted accounts 30 days after deletion

### 12.2 Frontend — Onboarding

- `OnboardingPageComponent` — multi-step flow for new users after registration
- `OnboardingSearchStepComponent` — lets new users add games they've played using the `GameSearchInputComponent`
- `OnboardingPrefsStepComponent` — genre preferences to seed the taste profile
- Wire `onboardingGuard` — redirects to `/onboarding` if the user has not completed it

### 12.3 Frontend — Settings

- `SettingsPageComponent` — `/settings`
- `AccountSettingsComponent` — update username, email, bio, avatar
- `PrivacySettingsComponent` — profile visibility defaults
- `GameProfilesComponent` — link/unlink PSN, Xbox, Steam usernames
- `DangerZoneComponent` — account deletion with confirmation

### 12.4 Shared components polish

- `LoadingSkeletonComponent` — add to all pages that load async data
- `EmptyStateComponent` — for empty libraries, no friends, no results
- `ConfirmDialogComponent` — used in danger zone and anywhere a destructive action needs confirmation
- `TimeAgoPipe`, `TruncatePipe`, `StatusLabelPipe` — wire these up everywhere they are used

### 12.5 Not found

- `NotFoundPageComponent` — `/not-found` and wildcard route catch-all

**Checkpoint:** New users are walked through onboarding. Existing users can update their settings and delete their account. All loading and empty states are handled gracefully across the app.

---

## Phase 13 — Production Deployment

Do this when you are satisfied the app works locally end-to-end.

### Backend (Railway)

- Create a Railway account and project
- Add a PostgreSQL service — Railway provides one
- Deploy the Spring Boot app to Railway from the GitHub repo
- Set environment variables in Railway: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `SPRING_PROFILES_ACTIVE=prod`
- Flyway runs automatically on startup and applies `V1__initial_schema.sql` to the production database
- Update `application.properties` to set `spring.jpa.hibernate.ddl-auto=validate` for production (already set — confirm it)

### Frontend (Vercel)

- Create a Vercel account
- Connect the `levelup` Angular repo to Vercel
- Set the build command to `ng build --configuration production`
- Set the output directory to `dist/levelup/browser`
- Set `VITE_API_URL` or update `environment.prod.ts` with the Railway backend URL before deploying
- Configure Vercel to redirect all routes to `index.html` (required for Angular's client-side routing) — add a `vercel.json` file:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Checkpoint:** The app is live. Register an account in production, add a game, complete a challenge, verify the scheduler is running.

---

## Build order summary

```
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

## A note on the Flyway migration file

Every time you add a new entity in any phase, add its `CREATE TABLE` SQL to the migration immediately — do not leave it until the end. A growing `V1__initial_schema.sql` file is normal. Add each new table as you build the entity that maps to it.

When you make a change to an existing table after it has been applied (adding a column, changing a constraint), you must create a new migration file: `V2__description.sql`, `V3__description.sql`, etc. Never edit a migration file that has already run against a database.

---

LevelUp — Development Plan — v1.0
