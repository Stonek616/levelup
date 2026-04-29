# LevelUp — TypeScript Models & Interfaces

**Version:** 2.0
**Location:** `src/app/core/models/`
**Purpose:** Defines every TypeScript interface and enum that mirrors the API response shapes. Import these into services and components for full type safety throughout the app.

---

## Table of Contents

1. [enums.ts](#1-enumsts)
2. [api-response.model.ts](#2-api-responsemodelts)
3. [user.model.ts](#3-usermodelts) — includes `UserSearchResult`
4. [game.model.ts](#4-gamemodelts)
5. [library-entry.model.ts](#5-library-entrymodelts)
6. [review.model.ts](#6-reviewmodelts)
7. [friend.model.ts](#7-friendmodelts)
8. [feed-event.model.ts](#8-feed-eventmodelts)
9. [collection.model.ts](#9-collectionmodelts)
10. [discovery.model.ts](#10-discoverymodelts)
11. [challenge.model.ts](#11-challengemodelts)
12. [what-to-play.model.ts](#12-what-to-playmodelts)
13. [game-card.model.ts](#13-game-cardmodelts) — `GameCardInput` discriminated union for `GameCardComponent`

---

## 1. enums.ts

`src/app/core/models/enums.ts`

```typescript
export enum LibraryStatus {
  Wishlist = 'WISHLIST',
  Backlog = 'BACKLOG',
  Playing = 'PLAYING',
  Played = 'PLAYED',
  Finished = 'FINISHED',
  Completed = 'COMPLETED',
  Abandoned = 'ABANDONED',
}

export enum FriendshipStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
}

export enum FeedEventType {
  StatusChange = 'STATUS_CHANGE',
  RatingAdded = 'RATING_ADDED',
  ReviewPosted = 'REVIEW_POSTED',
  CollectionCreated = 'COLLECTION_CREATED',
  GameAdded = 'GAME_ADDED',
}

export enum VisibilityType {
  Public = 'PUBLIC',
  Friends = 'FRIENDS',
  Private = 'PRIVATE',
}

export enum TimeAvailable {
  Short = 'SHORT',
  FewHours = 'FEW_HOURS',
  AllDay = 'ALL_DAY',
}

export enum Mood {
  Chill = 'CHILL',
  Story = 'STORY',
  Challenge = 'CHALLENGE',
  Social = 'SOCIAL',
  Anything = 'ANYTHING',
}

export enum SuggestionSource {
  Backlog = 'BACKLOG',
  Owned = 'OWNED',
  AlreadyPlayed = 'ALREADY_PLAYED',
  NewSuggestion = 'NEW_SUGGESTION',
}

export enum Platform {
  PC = 'PC',
  PlayStation = 'PLAYSTATION',
  Xbox = 'XBOX',
  Switch = 'SWITCH',
  Any = 'ANY',
}

// Display label map — use with StatusLabelPipe or directly in templates
export const LibraryStatusLabels: Record<LibraryStatus, string> = {
  [LibraryStatus.Wishlist]: 'Wishlist',
  [LibraryStatus.Backlog]: 'Backlog',
  [LibraryStatus.Playing]: 'Playing',
  [LibraryStatus.Played]: 'Played',
  [LibraryStatus.Finished]: 'Finished',
  [LibraryStatus.Completed]: 'Completed',
  [LibraryStatus.Abandoned]: 'Abandoned',
};
```

---

## 2. api-response.model.ts

`src/app/core/models/api-response.model.ts`

```typescript
// Standard paginated response wrapper — matches Spring Page<T> serialisation
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Standard error response
export interface ErrorResponse {
  error: string;
  status: number;
  message: string;
}

// Validation error response
export interface ValidationErrorResponse extends ErrorResponse {
  fields: Record<string, string>;
}
```

---

## 3. user.model.ts

`src/app/core/models/user.model.ts`

```typescript
import { VisibilityType } from './enums';

// Full user profile — returned only by GET /users/me. Not used in auth responses.
export interface User {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  libraryCount: number;
  completedCount: number;
  reviewCount: number;
  onboardingCompleted: boolean;
}

// Public profile — returned for /users/:username
export interface UserProfile {
  id: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  libraryCount: number;
  completedCount: number;
  reviewCount: number;
  isFriend: boolean;
  friendRequestStatus: string | null;
}

// Minimal user summary — used in lists, friend cards, review authors
export interface UserSummary {
  id: string;
  username: string;
  avatarUrl: string | null;
  isFriend?: boolean;
  friendRequestStatus?: string | null;
}

// Search result — extends UserSummary with required friendship fields.
// GET /users/search always returns isFriend and friendRequestStatus, so
// components receiving this type do not need null-checks for those fields.
export interface UserSearchResult extends UserSummary {
  isFriend: boolean;
  friendRequestStatus: string | null;
}

// Taste profile
export interface TasteProfile {
  username: string;
  genres: GenreBreakdown[];
  topTags: string[];
  topPlatforms: string[];
  averageRating: number;
  totalRated: number;
  compatibility: number | null;
}

export interface GenreBreakdown {
  name: string;
  count: number;
  percentage: number;
}

// Slim user shape returned in auth responses (login, register, refresh).
// Does not include profile fields — fetch those via GET /users/me after app load.
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
}

// Auth response — returned on login, register, and refresh
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

// Request bodies
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  bio?: string;
  avatarUrl?: string;
}

export interface PrivacySettings {
  libraryVisibility: VisibilityType;
  wishlistVisibility: VisibilityType;
  reviewsVisibility: VisibilityType;
}
```

---

## 4. game.model.ts

`src/app/core/models/game.model.ts`

```typescript
import { LibraryStatus } from './enums';

// Full game detail — returned for /games/:id
// Note: userEntry and friendEntries use inline types to avoid circular imports
// with library-entry.model.ts
export interface Game {
  id: string;
  igdbId: number;
  title: string;
  coverUrl: string | null;
  releaseYear: number | null;
  description: string | null;
  genres: string[];
  platforms: string[];
  tags: string[];
  gameModes: string[];
  communityRating: number | null;
  totalRatings: number;
  userEntry: GameUserEntry | null;
  friendEntries: FriendGameEntry[];
}

// Inline type for the current user's entry on a game detail page
// Avoids circular import with library-entry.model.ts
export interface GameUserEntry {
  status: LibraryStatus;
  isOwned: boolean;
  platforms: string[];
  rating: number | null;
}

// Minimal game — used in cards, lists, search results
export interface GameSummary {
  id: string;
  igdbId: number;
  title: string;
  coverUrl: string | null;
  releaseYear: number | null;
  genres: string[];
  platforms: string[];
}

// Entry on a game detail page for friends
export interface FriendGameEntry {
  username: string;
  avatarUrl: string | null;
  status: string;
  rating: number | null;
}

// FriendGameEntry is defined above — no circular imports needed
```

---

## 4b. game-profile.model.ts

`src/app/core/models/game-profile.model.ts`

```typescript
// User's linked gaming platform profiles (PSN, Xbox, Steam, etc.)
export interface GameProfile {
  id: string;
  platform: string;
  handle: string;
}

// Request body
export interface CreateGameProfileRequest {
  platform: string;
  handle: string;
}
```

---

## 5. library-entry.model.ts

`src/app/core/models/library-entry.model.ts`

```typescript
import { LibraryStatus } from './enums';
import { GameSummary } from './game.model';

// Full library entry — returned from /library
export interface LibraryEntry {
  id: string;
  game: GameSummary;
  status: LibraryStatus;
  isOwned: boolean;
  platforms: string[];
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}

// Shared game — returned from /library/shared/:username
export interface SharedGame {
  id: string;
  title: string;
  coverUrl: string | null;
  genres: string[];
  gameModes: string[];
  currentUserEntry: SharedGameEntry;
  friendEntry: SharedGameEntry;
}

export interface SharedGameEntry {
  status: LibraryStatus;
  isOwned: boolean;
}

// Request bodies
export interface CreateLibraryEntryRequest {
  gameId: string;
  status: LibraryStatus;
  isOwned: boolean;
  platforms?: string[];
}

export interface UpdateLibraryEntryRequest {
  status?: LibraryStatus;
  isOwned?: boolean;
  platforms?: string[];
  rating?: number;
}
```

---

## 6. review.model.ts

`src/app/core/models/review.model.ts`

```typescript
import { UserSummary } from './user.model';
import { GameSummary } from './game.model';

export interface Review {
  id: string;
  author: UserSummary;
  game: GameSummary;
  body: string;                // required — reviews must have text
  rating: number | null;       // read from author's library entry, not stored on review
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isFriendReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewComment {
  id: string;
  author: UserSummary;
  body: string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface LikeResponse {
  likeCount: number;
  likedByMe: boolean;
}

// Request bodies
export interface CreateReviewRequest {
  body: string;                // required — a review must have text
  rating?: number;             // optional — if provided, updates library entry rating
}

export interface UpdateReviewRequest {
  rating?: number;
  body?: string;
}

export interface CreateCommentRequest {
  body: string;
}
```

---

## 7. friend.model.ts

`src/app/core/models/friend.model.ts`

```typescript
import { UserSummary } from './user.model';
import { FriendshipStatus } from './enums';

export interface Friend extends UserSummary {
  bio: string | null;
  friendSince: string;    // from friendships.created_at
}

export interface FriendRequest {
  id: string;             // from friend_requests table
  requester: UserSummary;
  createdAt: string;
}

export interface FriendRequestResponse {
  id: string;
  status: FriendshipStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Request bodies
export interface SendFriendRequestRequest {
  targetUserId: string;
}

export interface RespondToFriendRequestRequest {
  action: 'ACCEPT' | 'DECLINE';
}
```

---

## 8. feed-event.model.ts

`src/app/core/models/feed-event.model.ts`

```typescript
import { UserSummary } from './user.model';
import { GameSummary } from './game.model';
import { FeedEventType, LibraryStatus } from './enums';

export interface FeedEvent {
  id: string;
  type: FeedEventType;
  user: UserSummary;
  game: GameSummary;
  metadata: FeedEventMetadata;
  createdAt: string;
}

// Union type for metadata — different events carry different data
export type FeedEventMetadata =
  | StatusChangeMeta
  | RatingAddedMeta
  | ReviewPostedMeta
  | CollectionCreatedMeta
  | GameAddedMeta;

export interface StatusChangeMeta {
  oldStatus: LibraryStatus;
  newStatus: LibraryStatus;
}

export interface RatingAddedMeta {
  rating: number;
}

export interface ReviewPostedMeta {
  reviewId: string;
  rating: number;
  bodyPreview: string | null;
}

export interface CollectionCreatedMeta {
  collectionId: string;
  collectionName: string;
}

export interface GameAddedMeta {
  status: LibraryStatus;
}
```

---

## 9. collection.model.ts

`src/app/core/models/collection.model.ts`

```typescript
import { UserSummary } from './user.model';
import { GameSummary } from './game.model';
import { PagedResponse } from './api-response.model';

export interface Collection {
  id: string;
  owner: UserSummary;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  games: PagedResponse<CollectionGame>;
}

export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  gameCount: number;
  previewCovers: string[];
  createdAt: string;
}

export interface CollectionGame extends GameSummary {
  addedAt: string;
}

// Request bodies
export interface CreateCollectionRequest {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddGameToCollectionRequest {
  gameId: string;
}
```

---

## 10. discovery.model.ts

`src/app/core/models/discovery.model.ts`

```typescript
import { GameSummary } from './game.model';
import { LibraryStatus } from './enums';

// Trending feed item
export interface TrendingGame extends GameSummary {
  communityRating: number | null;
  totalRatings: number;
  recentActivity: number;
}

// Friends feed item
export interface FriendActivityGame extends GameSummary {
  friendActivity: FriendActivity[];
}

export interface FriendActivity {
  username: string;
  status: LibraryStatus;
  rating?: number;
}

// For You / Similar feed item
export interface RecommendedGame extends GameSummary {
  communityRating: number | null;
  reason: string;
}
```

---

## 11. challenge.model.ts

`src/app/core/models/challenge.model.ts`

```typescript
export interface DailyChallenge {
  id: string;
  challengeDate: string;
  challengeType: string;
  payload: Record<string, unknown>;
  completed: boolean;
  friendCompletedCount: number;
}

export interface CompletedChallenge extends DailyChallenge {
  result: ChallengeResult;
  friendScores: FriendChallengeScore[];
}

export interface ChallengeResult {
  score: number;
  shareText: string;
  completedAt: string;
}

export interface FriendChallengeScore {
  username: string;
  score: number;
  completedAt: string;
}

export interface ChallengeHistory {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  history: {
    content: ChallengeHistoryEntry[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

export interface ChallengeHistoryEntry {
  challengeDate: string;
  score: number;
  completedAt: string;
}
```

---

## 12. what-to-play.model.ts

`src/app/core/models/what-to-play.model.ts`

```typescript
import { TimeAvailable, Mood, SuggestionSource, Platform } from './enums';
import { GameSummary } from './game.model';

export interface WhatToPlayRequest {
  platform: Platform;
  timeAvailable: TimeAvailable;
  mood: Mood;
  multiplayer: boolean;
  includeAlreadyPlayed: boolean;
  includeNewSuggestions: boolean;
}

export interface WhatToPlayResponse {
  suggestions: GameSuggestion[];
}

export interface GameSuggestion {
  game: GameSummary;
  source: SuggestionSource;
  reason: string;
  rank: number;
}
```

---

## 13. game-card.model.ts

`src/app/core/models/game-card.model.ts`

`GameCardComponent` is used in the library grid, discovery feeds, friend library, collections, search results, and What to Play Next output. It must accept either a `LibraryEntry` (when the current user has it tracked) or a `GameSummary` (in discovery/search contexts). Define a discriminated union so the component template can narrow the type safely.

```typescript
import { LibraryEntry } from './library-entry.model';
import { GameSummary } from './game.model';

// Discriminated union for GameCardComponent @Input()
// Use the 'kind' discriminant to narrow in the template or component logic.
export type GameCardInput =
  | { kind: 'entry'; data: LibraryEntry }
  | { kind: 'game'; data: GameSummary };

// Type guard — use in component to narrow
export function isLibraryEntry(input: GameCardInput): input is { kind: 'entry'; data: LibraryEntry } {
  return input.kind === 'entry';
}
```

**Usage in component:**

```typescript
// In GameCardComponent:
@Input({ required: true }) card!: GameCardInput;

get game(): GameSummary {
  return isLibraryEntry(this.card) ? this.card.data.game : this.card.data;
}

get libraryEntry(): LibraryEntry | null {
  return isLibraryEntry(this.card) ? this.card.data : null;
}
```

When `libraryEntry` is non-null, render the status badge and owned indicator. When null, render in neutral discovery state.

---

LevelUp — TypeScript Models & Interfaces — v4.0

---

### Changelog (v4.0)

- Added `game-card.model.ts` with `GameCardInput` discriminated union type and `isLibraryEntry` type guard — resolves the untyped `LibraryEntry | Game` input described in the design doc

### Changelog (v3.0)

- Added `UserSearchResult` interface extending `UserSummary` with `isFriend` and `friendRequestStatus` required (non-optional) — use this type for `GET /users/search` responses to avoid unnecessary null-checks in components where these fields are guaranteed

### Changelog (v2.0)

- Fixed circular import between `game.model.ts` and `library-entry.model.ts` — game model now uses inline `GameUserEntry` type instead of importing `LibraryEntrySummary`
- Updated `platform` to `platforms: string[]` (array) on `LibraryEntry`, `CreateLibraryEntryRequest`, `UpdateLibraryEntryRequest`
- Made `Review.body` required (non-nullable) — reviews must have text
- Made `Review.rating` nullable — sourced from library entry, may not exist
- Updated `CreateReviewRequest` — body is required, rating is optional
- Added `Platform` enum for What to Play Next feature
- Added `platform` field to `WhatToPlayRequest`
- Added `game-profile.model.ts` with `GameProfile` and `CreateGameProfileRequest`
- Renamed `FriendshipResponse` to `FriendRequestResponse` for clarity with dual-row model
