# LevelUp — API Endpoint Design
 
**Version:** 5.0
**Base URL:** `/api/v1`
**Auth:** JWT Bearer token — `Authorization: Bearer <access_token>`
**Format:** All requests and responses are `application/json` unless otherwise noted

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Auth endpoints](#2-auth-endpoints)
3. [User & profile endpoints](#3-user--profile-endpoints)
4. [Game search endpoints](#4-game-search-endpoints)
5. [Library endpoints](#5-library-endpoints)
6. [Review endpoints](#6-review-endpoints)
7. [Comment endpoints](#7-comment-endpoints)
8. [Friend endpoints](#8-friend-endpoints)
9. [Feed endpoints](#9-feed-endpoints)
10. [Discovery endpoints](#10-discovery-endpoints)
11. [Collection endpoints](#11-collection-endpoints)
12. [What to Play Next endpoints](#12-what-to-play-next-endpoints)
13. [Daily challenge endpoints](#13-daily-challenge-endpoints)
14. [Settings endpoints](#14-settings-endpoints)

---

## 1. Conventions

### Auth tiers

| Tier | Meaning |
| --- | --- |
| Public | No token required — available to logged-out users |
| Protected | Valid JWT required — returns `401` if missing or expired |
| Owner-only | Protected + requesting user must own the resource — returns `403` otherwise |

### Standard error shape

```json
{
  "error": "RESOURCE_NOT_FOUND",
  "status": 404,
  "message": "Game with id 'abc123' not found"
}
```

### Validation error shape

```json
{
  "error": "VALIDATION_FAILED",
  "status": 400,
  "message": "Request body contains invalid fields",
  "fields": {
    "username": "must be between 3 and 30 characters",
    "email": "must be a valid email address"
  }
}
```

### Common HTTP status codes used

| Code | Meaning |
| --- | --- |
| `200` | OK — successful GET, PUT, PATCH |
| `201` | Created — successful POST that creates a resource |
| `204` | No Content — successful DELETE |
| `400` | Bad Request — validation failure or malformed body |
| `401` | Unauthorised — missing or invalid JWT |
| `403` | Forbidden — authenticated but not permitted |
| `404` | Not Found — resource does not exist |
| `409` | Conflict — duplicate resource (e.g. friend request already exists) |
| `500` | Internal Server Error |

*`409` convention: used when the client is sending a valid, well-formed request but the resource already exists or a uniqueness constraint would be violated (e.g. "game already in library", "already reviewed this game", "already friends"). The client should branch on `409` to show a relevant UI state rather than a generic error. `400` is reserved for malformed or invalid input.*

### Pagination

All list endpoints accept these query params:

| Param | Default | Description |
| --- | --- | --- |
| `page` | `0` | Zero-indexed page number |
| `size` | `20` | Items per page (max 50) |
| `sort` | varies | Sort field, e.g. `createdAt,desc` |

All paginated responses follow this envelope:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "last": false
}
```

*`totalPages` is a convenience field — it equals `Math.ceil(totalElements / size)`. Use `totalElements` and `last` as the authoritative fields for pagination logic.*

---

## 2. Auth Endpoints

### POST `/api/v1/auth/register`

**Auth:** Public  
**Description:** Create a new user account.

**Request body:**

```json
{
  "username": "stone",
  "email": "stone@example.com",
  "password": "securepassword123"
}
```

**Response `201`:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "username": "stone",
    "email": "stone@example.com",
    "avatarUrl": null,
    "onboardingCompleted": false
  }
}
```

*Also sets an HttpOnly secure cookie containing a refresh token (2-week expiry).*

**Errors:** `400` validation failed, `409` username or email already taken

---

### POST `/api/v1/auth/login`

**Auth:** Public  
**Description:** Authenticate and receive a JWT.

**Request body:**

```json
{
  "email": "stone@example.com",
  "password": "securepassword123"
}
```

**Response `200`:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "username": "stone",
    "email": "stone@example.com",
    "avatarUrl": null,
    "onboardingCompleted": true
  }
}
```

*Also sets an HttpOnly secure cookie containing a refresh token (2-week expiry).*

**Errors:** `400` missing fields, `401` invalid credentials

---

### POST `/api/v1/auth/forgot-password`

**Auth:** Public  
**Description:** Send a password reset email.

**Request body:**

```json
{
  "email": "stone@example.com"
}
```

**Response `200`:**

```json
{
  "message": "If an account exists for that email, a reset link has been sent."
}
```

*Note: Always returns 200 regardless of whether the email exists — prevents account enumeration.*

---

### POST `/api/v1/auth/reset-password`

**Auth:** Public  
**Description:** Reset password using token from email link.

**Request body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "newsecurepassword123"
}
```

**Response `200`:**

```json
{
  "message": "Password updated successfully."
}
```

**Errors:** `400` token expired or invalid

---

### POST `/api/v1/auth/refresh`

**Auth:** Public (uses HttpOnly cookie)
**Description:** Issue a new access token using the refresh token stored in an HttpOnly cookie. Called on app load to restore sessions and when the current access token expires.

*No request body — the refresh token is read from the HttpOnly cookie automatically.*

**Response `200`:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "username": "stone",
    "email": "stone@example.com",
    "avatarUrl": null,
    "onboardingCompleted": true
  }
}
```

*Auth responses carry only the fields needed to boot the session: `id`, `username`, `email`, `avatarUrl`, and `onboardingCompleted`. `onboardingCompleted` is critical — `onboardingGuard` reads it immediately after session restore. Full profile data (`bio`, `createdAt`, `libraryCount`, `completedCount`, `reviewCount`) is fetched separately via `GET /users/me` once on app load.*

*Also sets a new HttpOnly cookie with a fresh refresh token (token rotation).*

**Errors:** `401` refresh token missing, expired, or revoked

---

### POST `/api/v1/auth/logout`

**Auth:** Protected
**Description:** Revoke the current refresh token and clear the HttpOnly cookie. Prevents the refresh token from being reused.

**Response `200`:**

```json
{
  "message": "Logged out successfully."
}
```

*Clears the refresh token cookie on the response.*

---

## 3. User & Profile Endpoints

### GET `/api/v1/users/me`

**Auth:** Protected  
**Description:** Get the currently authenticated user's profile.

**Response `200`:**

```json
{
  "id": "uuid",
  "username": "stone",
  "email": "stone@example.com",
  "bio": "I play too many RPGs",
  "avatarUrl": "https://...",
  "createdAt": "2025-01-01T00:00:00Z",
  "libraryCount": 47,
  "completedCount": 12,
  "reviewCount": 8,
  "onboardingCompleted": true
}
```

---

### GET `/api/v1/users/:username`

**Auth:** Public  
**Description:** Get a public user profile by username.

**Response `200`:**

```json
{
  "id": "uuid",
  "username": "stone",
  "bio": "I play too many RPGs",
  "avatarUrl": "https://...",
  "createdAt": "2025-01-01T00:00:00Z",
  "libraryCount": 47,
  "completedCount": 12,
  "reviewCount": 8,
  "isFriend": true,
  "friendRequestStatus": null
}
```

*Note: `isFriend` and `friendRequestStatus` are populated when request is authenticated.*

**Errors:** `404` user not found

---

### GET `/api/v1/users/search`

**Auth:** Protected  
**Description:** Search for users by username. Used for the find friends feature.

**Query params:** `?q=stone&page=0&size=10`

**Response `200`:** Paginated list of user summaries.

```json
{
  "content": [
    {
      "id": "uuid",
      "username": "stone",
      "avatarUrl": "https://...",
      "isFriend": false,
      "friendRequestStatus": "PENDING"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 3,
  "totalPages": 1,
  "last": true
}
```

---

### GET `/api/v1/users/:username/taste-profile`

**Auth:** Public  
**Description:** Get a user's taste profile — genre breakdown and top tags derived from their rated and completed games.

**Response `200`:**

```json
{
  "username": "stone",
  "genres": [
    { "name": "RPG", "count": 18, "percentage": 38 },
    { "name": "Action", "count": 12, "percentage": 26 },
    { "name": "Indie", "count": 9, "percentage": 19 }
  ],
  "topTags": ["open world", "narrative", "single player", "story rich"],
  "topPlatforms": ["PC", "PlayStation 5"],
  "averageRating": 7.4,
  "totalRated": 47,
  "compatibility": null
}
```

*Note: `compatibility` is a 0–100 score populated only when the request is authenticated and the profile belongs to a friend.*

---

### PATCH `/api/v1/users/me`

**Auth:** Protected  
**Description:** Update the current user's profile.

**Request body** *(all fields optional):*

```json
{
  "bio": "Updated bio text",
  "avatarUrl": "https://..."
}
```

**Response `200`:** Updated user object (same shape as `GET /users/me`).

**Errors:** `400` validation failed

---

### POST `/api/v1/users/me/onboarding`

**Auth:** Protected
**Description:** Submit onboarding data and mark onboarding as complete in a single atomic operation. Called after the user finishes both onboarding steps (genre preferences + library seed). Saves the taste profile and sets `onboardingCompleted = true` together so partial state is never possible.

**Request body:**

```json
{
  "favouriteGenres": ["RPG", "Action", "Indie"],
  "platforms": ["PC", "PlayStation"],
  "seededGameIds": ["uuid1", "uuid2", "uuid3"]
}
```

*`seededGameIds` is optional — the user may skip the library seed step. `favouriteGenres` must have at least one entry.*

**Response `200`:**

```json
{
  "message": "Onboarding complete."
}
```

*Genre preferences are stored against the user's taste profile and used to seed `GET /discover/for-you` results.*

**Errors:** `400` empty genres list

---

### POST `/api/v1/users/me/avatar`

**Auth:** Protected
**Description:** Upload an avatar image. Accepts `multipart/form-data` with a single file field. Max file size: 2MB. Accepted formats: JPEG, PNG, WebP.

**Request:** `Content-Type: multipart/form-data` with field `file`.

**Response `200`:**

```json
{
  "avatarUrl": "https://your-storage-host.com/avatars/uuid.webp"
}
```

**Errors:** `400` file missing, unsupported format, or exceeds size limit

---

### DELETE `/api/v1/users/me`

**Auth:** Protected
**Description:** Soft-delete the current user's account. The account is marked inactive immediately and permanently purged after 30 days. During the recovery window, the user can log in to reactivate.

**Request body:**

```json
{
  "currentPassword": "securepassword123"
}
```

**Response `200`:**

```json
{
  "message": "Account scheduled for deletion. You have 30 days to log in and reactivate."
}
```

**Errors:** `401` wrong password

---

### GET `/api/v1/users/me/game-profiles`

**Auth:** Protected
**Description:** Get the current user's linked gaming platform profiles (PSN, Xbox, Steam, etc.).

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "platform": "PSN",
    "handle": "stone_plays"
  },
  {
    "id": "uuid",
    "platform": "Steam",
    "handle": "stonekillen"
  }
]
```

---

### POST `/api/v1/users/me/game-profiles`

**Auth:** Protected
**Description:** Add a gaming platform profile.

**Request body:**

```json
{
  "platform": "PSN",
  "handle": "stone_plays"
}
```

**Response `201`:** The created game profile object.

**Errors:** `400` validation failed, `409` platform already linked

---

### DELETE `/api/v1/users/me/game-profiles/:profileId`

**Auth:** Protected
**Description:** Remove a linked gaming platform profile.

**Response `204`:** No content.

**Errors:** `404` profile not found

---

### GET `/api/v1/users/:username/game-profiles`

**Auth:** Protected (friends only)
**Description:** Get a friend's linked gaming platform profiles. Only accessible to confirmed friends.

**Response `200`:** Same shape as `GET /users/me/game-profiles`.

**Errors:** `403` not friends, `404` user not found

---

## 4. Game Search Endpoints

### GET `/api/v1/games/search`

**Auth:** Public  
**Description:** Search for games by title. Checks the local cache first; falls back to IGDB on a cache miss. Results are cached to the local `games` table as a side effect.

**Query params:** `?q=zelda&page=0&size=10`

**Response `200`:** Paginated list of game summaries.

```json
{
  "content": [
    {
      "id": "uuid",
      "igdbId": 1234,
      "title": "The Legend of Zelda: Breath of the Wild",
      "coverUrl": "https://...",
      "releaseYear": 2017,
      "genres": ["Action", "Adventure"],
      "platforms": ["Switch", "Wii U"]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 4,
  "totalPages": 1,
  "last": true
}
```

---

### GET `/api/v1/games/:id`

**Auth:** Public  
**Description:** Get full game detail by local UUID.

**Response `200`:**

```json
{
  "id": "uuid",
  "igdbId": 1234,
  "title": "The Legend of Zelda: Breath of the Wild",
  "coverUrl": "https://...",
  "releaseYear": 2017,
  "description": "Step into a world of discovery...",
  "genres": ["Action", "Adventure"],
  "platforms": ["Switch", "Wii U"],
  "tags": ["open world", "exploration", "survival"],
  "gameModes": ["single_player"],
  "communityRating": 9.1,
  "totalRatings": 2840,
  "userEntry": null,
  "friendEntries": []
}
```

*Note: `userEntry` is the authenticated user's library entry if it exists. `friendEntries` is a list of friend ratings/statuses — populated when authenticated.*

*`communityRating` is `null` when fewer than 3 ratings exist for the game. `totalRatings` indicates the current count — use it to show "Not enough ratings yet" rather than treating `null` as an error.*

**Errors:** `404` game not found

---

## 5. Library Endpoints

### GET `/api/v1/library`

**Auth:** Protected  
**Description:** Get the current user's full library.

**Query params:** `?status=PLAYING&owned=true&platforms=PC&sort=updatedAt,desc&page=0&size=20`

All query params are optional filters.

**Response `200`:** Paginated list of library entries.

```json
{
  "content": [
    {
      "id": "uuid",
      "game": {
        "id": "uuid",
        "title": "Elden Ring",
        "coverUrl": "https://...",
        "releaseYear": 2022,
        "genres": ["Action", "RPG"]
      },
      "status": "PLAYING",
      "isOwned": true,
      "platforms": ["PC"],
      "rating": null,
      "createdAt": "2025-03-01T00:00:00Z",
      "updatedAt": "2025-03-15T00:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 47,
  "totalPages": 3,
  "last": false
}
```

---

### POST `/api/v1/library`

**Auth:** Protected  
**Description:** Add a game to the current user's library. The game must already exist in the local `games` table (added via game search). Creates the library entry.

**Request body:**

```json
{
  "gameId": "uuid",
  "status": "BACKLOG",
  "isOwned": true,
  "platforms": ["PC"]
}
```

**Response `201`:** The created library entry (same shape as entry object above).

**Errors:** `400` invalid status value, `404` game not found, `409` entry already exists for this game

---

### PATCH `/api/v1/library/:entryId`

**Auth:** Owner-only  
**Description:** Update a library entry — change status, owned flag, platforms, or rating.

**Request body** *(all fields optional):*

```json
{
  "status": "FINISHED",
  "isOwned": true,
  "platforms": ["PS5", "PC"],
  "rating": 9
}
```

**Response `200`:** Updated library entry.

**Errors:** `400` invalid field values, `403` not owner, `404` entry not found

---

### DELETE `/api/v1/library/:entryId`

**Auth:** Owner-only  
**Description:** Remove a game from the library entirely.

**Response `204`:** No content.

**Errors:** `403` not owner, `404` entry not found

---

### GET `/api/v1/users/:username/library`

**Auth:** Protected (friends only)  
**Description:** Get another user's library. Only accessible to confirmed friends.

**Query params:** Same filters as `GET /library` plus `?ownedOnly=true` to filter by owned flag.

**Response `200`:** Same paginated shape as `GET /library`.

**Errors:** `403` not friends, `404` user not found

---

### GET `/api/v1/library/shared/:username`

**Auth:** Protected  
**Description:** Get games owned by both the current user and the specified friend. Uses the `is_owned` flag intersection.

**Query params:** `?gameModes=multiplayer,co_op&page=0&size=20`

**Response `200`:** Paginated list of game objects (not full library entries — just the games in common).

```json
{
  "content": [
    {
      "id": "uuid",
      "title": "It Takes Two",
      "coverUrl": "https://...",
      "genres": ["Action", "Adventure"],
      "gameModes": ["co_op"],
      "currentUserEntry": {
        "status": "BACKLOG",
        "isOwned": true
      },
      "friendEntry": {
        "status": "COMPLETED",
        "isOwned": true
      }
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 8,
  "totalPages": 1,
  "last": true
}
```

**Errors:** `403` not friends, `404` user not found

---

## 6. Review Endpoints

### GET `/api/v1/games/:gameId/reviews`

**Auth:** Public  
**Description:** Get all reviews for a game. When authenticated, friend reviews are sorted first.

**Query params:** `?sort=createdAt,desc&page=0&size=10`

**Response `200`:** Paginated list of reviews.

```json
{
  "content": [
    {
      "id": "uuid",
      "author": {
        "id": "uuid",
        "username": "stone",
        "avatarUrl": "https://..."
      },
      "game": {
        "id": "uuid",
        "title": "Elden Ring"
      },
      "body": "A masterpiece of environmental storytelling...",
      "rating": 10,
      "likeCount": 24,
      "commentCount": 3,
      "likedByMe": false,
      "isFriendReview": true,
      "createdAt": "2025-03-01T00:00:00Z",
      "updatedAt": "2025-03-01T00:00:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 42,
  "totalPages": 5,
  "last": false
}
```

*Note: The `rating` field on reviews is read from the author's `library_entries.rating` for that game — it is not stored on the review itself. This ensures a single source of truth for ratings.*

---

### POST `/api/v1/games/:gameId/reviews`

**Auth:** Protected  
**Description:** Create a review for a game. User must have a library entry for the game.

**Request body:**

```json
{
  "body": "A masterpiece of environmental storytelling..."
}
```

*`body` is required — a review is a deliberate written piece. The review displays whatever `library_entries.rating` already holds for this user + game — rating is not accepted here and cannot be set via this endpoint. To set or update a rating, call `PATCH /library/:entryId` before or after creating the review.*

**Response `201`:** The created review object.

**Errors:** `400` body missing or empty, `403` no library entry for this game, `409` user has already reviewed this game

---

### GET `/api/v1/reviews/:reviewId`

**Auth:** Public  
**Description:** Get a single review by ID with full detail.

**Response `200`:** Full review object (same shape as above).

**Errors:** `404` review not found

---

### PATCH `/api/v1/reviews/:reviewId`

**Auth:** Owner-only  
**Description:** Edit a review body or rating.

**Request body** *(all fields optional):*

```json
{
  "body": "Updated review text...",
  "rating": 9
}
```

**Response `200`:** Updated review object.

**Errors:** `403` not owner, `404` not found

---

### DELETE `/api/v1/reviews/:reviewId`

**Auth:** Owner-only  
**Description:** Delete a review and its associated comments.

**Response `204`:** No content.

**Errors:** `403` not owner, `404` not found

---

### POST `/api/v1/reviews/:reviewId/like`

**Auth:** Protected  
**Description:** Like a review. Idempotent — liking an already-liked review does nothing.

**Response `200`:**

```json
{
  "likeCount": 25,
  "likedByMe": true
}
```

---

### DELETE `/api/v1/reviews/:reviewId/like`

**Auth:** Protected  
**Description:** Unlike a review.

**Response `200`:**

```json
{
  "likeCount": 24,
  "likedByMe": false
}
```

---

### GET `/api/v1/users/:username/reviews`

**Auth:** Public
**Description:** Get all reviews written by a user. Respects the user's `reviewsVisibility` privacy setting.

**Privacy enforcement:**
- `PUBLIC` → returned to everyone
- `FRIENDS` → returned only to confirmed friends (authenticated request where `isFriend === true`); returns empty list with `200` to others
- `PRIVATE` → returns empty list with `200` to everyone except the owner

*The service layer checks `UserPrivacySettings.reviewsVisibility` and filters accordingly. The same enforcement pattern applies to `/api/v1/users/:username/library` (governed by `libraryVisibility`) and wishlist-status library entries (governed by `wishlistVisibility` — these appear as a filtered view, not a separate endpoint).*

*Collections use a different visibility mechanism: each collection has its own `isPublic` boolean. `GET /users/:username/collections` returns only collections where `isPublic = true` to non-owners — this is enforced per-resource, not by a global privacy setting. `wishlistVisibility` does NOT govern collection access. Always return `200` with an empty list rather than `403` for visibility-restricted content — this avoids leaking the existence of the content.*

**Query params:** `?page=0&size=10&sort=createdAt,desc`

**Response `200`:** Paginated list of review objects.

---

## 7. Comment Endpoints

### GET `/api/v1/reviews/:reviewId/comments`

**Auth:** Public  
**Description:** Get all flat comments on a review.

**Query params:** `?page=0&size=20&sort=createdAt,asc`

**Response `200`:** Paginated list of comments.

```json
{
  "content": [
    {
      "id": "uuid",
      "author": {
        "id": "uuid",
        "username": "stone",
        "avatarUrl": "https://..."
      },
      "body": "Totally agree about the boss design.",
      "likeCount": 3,
      "likedByMe": false,
      "createdAt": "2025-03-02T00:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 3,
  "totalPages": 1,
  "last": true
}
```

---

### POST `/api/v1/reviews/:reviewId/comments`

**Auth:** Protected  
**Description:** Post a comment on a review.

**Request body:**

```json
{
  "body": "Totally agree about the boss design."
}
```

**Response `201`:** The created comment object.

**Errors:** `400` empty body, `404` review not found

---

### DELETE `/api/v1/comments/:commentId`

**Auth:** Owner-only  
**Description:** Delete a comment.

**Response `204`:** No content.

**Errors:** `403` not owner, `404` not found

---

### POST `/api/v1/comments/:commentId/like`

**Auth:** Protected  
**Description:** Like a comment. Idempotent.

**Response `200`:**

```json
{
  "likeCount": 4,
  "likedByMe": true
}
```

---

### DELETE `/api/v1/comments/:commentId/like`

**Auth:** Protected  
**Description:** Unlike a comment.

**Response `200`:**

```json
{
  "likeCount": 3,
  "likedByMe": false
}
```

---

## 8. Friend Endpoints

*Friendships use a dual-row model: when a request is accepted, two rows are inserted in the `friendships` table (one per direction). This allows all friend queries to use a simple `WHERE user_id = ?` lookup. The `friend_requests` table retains request history.*

### GET `/api/v1/friends`

**Auth:** Protected
**Description:** Get the current user's confirmed friends list. Reads from the `friendships` table.

**Query params:** `?page=0&size=20`

**Response `200`:** Paginated list of user summaries.

```json
{
  "content": [
    {
      "id": "uuid",
      "username": "player2",
      "avatarUrl": "https://...",
      "bio": "Co-op enjoyer",
      "friendSince": "2025-02-01T00:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 5,
  "totalPages": 1,
  "last": true
}
```

---

### GET `/api/v1/friends/requests`

**Auth:** Protected
**Description:** Get all pending friend requests received by the current user. Reads from the `friend_requests` table.

**Response `200`:**

```json
{
  "content": [
    {
      "id": "uuid",
      "requester": {
        "id": "uuid",
        "username": "newplayer",
        "avatarUrl": "https://..."
      },
      "createdAt": "2025-03-10T00:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

---

### POST `/api/v1/friends/requests`

**Auth:** Protected
**Description:** Send a friend request to another user. Creates a row in `friend_requests` with status PENDING.

**Request body:**

```json
{
  "targetUserId": "uuid"
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "status": "PENDING",
  "createdAt": "2025-03-10T00:00:00Z"
}
```

**Errors:** `404` target user not found, `409` request already exists or users are already friends

---

### PATCH `/api/v1/friends/requests/:requestId`

**Auth:** Protected (receiver only)
**Description:** Accept or decline a friend request. On ACCEPT: updates the `friend_requests` row to ACCEPTED and inserts two rows into `friendships` (one per direction). On DECLINE: updates the `friend_requests` row to DECLINED.

**Request body:**

```json
{
  "action": "ACCEPT"
}
```

*`action` is either `"ACCEPT"` or `"DECLINE"`.*

**Response `200`:**

```json
{
  "id": "uuid",
  "status": "ACCEPTED",
  "updatedAt": "2025-03-10T00:00:00Z"
}
```

**Errors:** `403` not the receiver, `404` request not found

---

### DELETE `/api/v1/friends/:userId`

**Auth:** Protected
**Description:** Remove a friend. Either party can unfriend. Deletes both rows from `friendships` (A→B and B→A).

**Response `204`:** No content.

**Errors:** `404` friendship not found

---

## 9. Feed Endpoints

### GET `/api/v1/feed`

**Auth:** Protected  
**Description:** Get the friends activity feed — status changes, completions, new reviews from confirmed friends.

**Query params:** `?page=0&size=20`

**Response `200`:** Paginated list of feed events.

```json
{
  "content": [
    {
      "id": "uuid",
      "type": "STATUS_CHANGE",
      "user": {
        "id": "uuid",
        "username": "player2",
        "avatarUrl": "https://..."
      },
      "game": {
        "id": "uuid",
        "title": "Elden Ring",
        "coverUrl": "https://..."
      },
      "metadata": {
        "oldStatus": "PLAYING",
        "newStatus": "COMPLETED"
      },
      "createdAt": "2025-03-15T00:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 64,
  "totalPages": 4,
  "last": false
}
```

*Feed event types: `STATUS_CHANGE`, `RATING_ADDED`, `REVIEW_POSTED`, `COLLECTION_CREATED`, `GAME_ADDED`. Events older than 90 days are eligible for cleanup.*

**Feed event deduplication — RATING_ADDED:**
A `RATING_ADDED` event is created when a user sets or changes their rating via `PATCH /library/:entryId`. To prevent feed spam, the rule is: create the event only if no `RATING_ADDED` event for the same user + game combination exists within the past 24 hours. If one exists within 24 hours, update the existing event's metadata (new rating value) rather than creating a new row. This prevents a user who adjusts their rating multiple times in one session from flooding friends' feeds.

---

## 10. Discovery Endpoints

### GET `/api/v1/discover/trending`

**Auth:** Public  
**Description:** Games trending across the platform — most added, rated, and reviewed in the past 7 days.

**Query params:** `?page=0&size=20`

**Response `200`:** Paginated list of game summaries with community stats.

```json
{
  "content": [
    {
      "id": "uuid",
      "title": "Elden Ring",
      "coverUrl": "https://...",
      "genres": ["Action", "RPG"],
      "communityRating": 9.1,
      "totalRatings": 2840,
      "recentActivity": 142
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 200,
  "totalPages": 10,
  "last": false
}
```

---

### GET `/api/v1/discover/friends`

**Auth:** Protected  
**Description:** Games friends are currently playing, recently completed, or highly rated.

**Query params:** `?page=0&size=20`

**Response `200`:** Paginated list of game summaries with friend activity context.

```json
{
  "content": [
    {
      "id": "uuid",
      "title": "Balatro",
      "coverUrl": "https://...",
      "genres": ["Strategy", "Indie"],
      "friendActivity": [
        { "username": "player2", "status": "PLAYING" },
        { "username": "player3", "status": "COMPLETED", "rating": 10 }
      ]
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 12,
  "totalPages": 1,
  "last": true
}
```

---

### GET `/api/v1/discover/for-you`

**Auth:** Protected  
**Description:** Personalised recommendations based on the user's taste profile. Excludes games already in the user's library.

**Query params:** `?page=0&size=20`

**Response `200`:** Paginated list of game summaries with recommendation reason.

```json
{
  "content": [
    {
      "id": "uuid",
      "title": "Hollow Knight",
      "coverUrl": "https://...",
      "genres": ["Action", "Indie"],
      "communityRating": 9.3,
      "reason": "Popular in genres you love — Action, Indie"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 40,
  "totalPages": 2,
  "last": false
}
```

---

### GET `/api/v1/discover/similar`

**Auth:** Protected  
**Description:** Games similar to titles the user has recently played or highly rated. Based on shared genres and tags.

**Query params:** `?page=0&size=20`

**Response `200`:** Same shape as `/for-you`, with `reason` referencing the source game.

```json
{
  "content": [
    {
      "id": "uuid",
      "title": "Dark Souls III",
      "coverUrl": "https://...",
      "genres": ["Action", "RPG"],
      "communityRating": 9.0,
      "reason": "Similar to Elden Ring, which you rated 10"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 18,
  "totalPages": 1,
  "last": true
}
```

---

### GET `/api/v1/discover/new`

**Auth:** Public  
**Description:** Recently released games with strong early community ratings.

**Query params:** `?page=0&size=20`

**Response `200`:** Paginated list of game summaries sorted by release date descending, filtered by minimum community rating.

---

## 11. Collection Endpoints

### GET `/api/v1/users/:username/collections`

**Auth:** Public (returns only public collections for non-owners; all collections for owner)
**Description:** Get a user's collections.

**Query params:** `?page=0&size=20`

**Response `200`:** Paginated list of collection summaries.

```json
{
  "content": [
    {
      "id": "uuid",
      "name": "Cozy games for winter",
      "description": "Perfect for rainy days",
      "isPublic": true,
      "gameCount": 8,
      "previewCovers": ["https://...", "https://...", "https://..."],
      "createdAt": "2025-01-15T00:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 3,
  "totalPages": 1,
  "last": true
}
```

---

### POST `/api/v1/collections`

**Auth:** Protected  
**Description:** Create a new collection.

**Request body:**

```json
{
  "name": "Games I finished with my partner",
  "description": "Our shared journey",
  "isPublic": false
}
```

**Response `201`:** The created collection object.

**Errors:** `400` name missing or too long

---

### GET `/api/v1/collections/:collectionId`

**Auth:** Public (returns `403` for private collections viewed by non-owners)  
**Description:** Get full collection detail including all games.

**Query params:** `?page=0&size=20`

**Response `200`:**

```json
{
  "id": "uuid",
  "owner": {
    "id": "uuid",
    "username": "stone"
  },
  "name": "Cozy games for winter",
  "description": "Perfect for rainy days",
  "isPublic": true,
  "createdAt": "2025-01-15T00:00:00Z",
  "games": {
    "content": [
      {
        "id": "uuid",
        "title": "Stardew Valley",
        "coverUrl": "https://...",
        "genres": ["Simulation", "RPG"],
        "addedAt": "2025-01-15T00:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 8,
    "totalPages": 1,
    "last": true
  }
}
```

**Errors:** `403` private collection, `404` not found

---

### PATCH `/api/v1/collections/:collectionId`

**Auth:** Owner-only  
**Description:** Update collection name, description, or visibility.

**Request body** *(all fields optional):*

```json
{
  "name": "Updated name",
  "description": "Updated description",
  "isPublic": true
}
```

**Response `200`:** Updated collection summary.

---

### DELETE `/api/v1/collections/:collectionId`

**Auth:** Owner-only  
**Description:** Delete a collection and all its entries.

**Response `204`:** No content.

---

### POST `/api/v1/collections/:collectionId/games`

**Auth:** Owner-only  
**Description:** Add a game to a collection.

**Request body:**

```json
{
  "gameId": "uuid"
}
```

**Response `201`:** Updated game count.

```json
{
  "gameCount": 9
}
```

**Errors:** `404` game or collection not found, `409` game already in collection

---

### DELETE `/api/v1/collections/:collectionId/games/:gameId`

**Auth:** Owner-only  
**Description:** Remove a game from a collection.

**Response `204`:** No content.

**Errors:** `403` not owner, `404` game not in collection

---

## 12. What to Play Next Endpoints

### POST `/api/v1/what-to-play`

**Auth:** Protected  
**Description:** Submit user constraints and receive a ranked shortlist of game suggestions. Pulls from the user's Backlog and Owned-but-unplayed games first, then optionally from outside the library.

**Request body:**

```json
{
  "platform": "PC",
  "timeAvailable": "FEW_HOURS",
  "mood": "CHILL",
  "multiplayer": false,
  "includeAlreadyPlayed": false,
  "includeNewSuggestions": true
}
```

*Enums:*

- `platform`: `PC`, `PLAYSTATION`, `XBOX`, `SWITCH`, `ANY` (optional — defaults to `ANY`)
- `timeAvailable`: `SHORT` (under 1 hour), `FEW_HOURS` (1–4 hours), `ALL_DAY` (4+ hours)
- `mood`: `CHILL`, `STORY`, `CHALLENGE`, `SOCIAL`, `ANYTHING`

**Response `200`:**

```json
{
  "suggestions": [
    {
      "game": {
        "id": "uuid",
        "title": "Celeste",
        "coverUrl": "https://...",
        "genres": ["Platformer", "Indie"],
        "gameModes": ["single_player"]
      },
      "source": "BACKLOG",
      "reason": "In your backlog — short playtime, fits your Chill mood",
      "rank": 1
    },
    {
      "game": {
        "id": "uuid",
        "title": "Firewatch",
        "coverUrl": "https://...",
        "genres": ["Adventure", "Indie"],
        "gameModes": ["single_player"]
      },
      "source": "NEW_SUGGESTION",
      "reason": "Matches your taste in narrative games — loved by 3 of your friends",
      "rank": 2
    }
  ]
}
```

*`source` values: `BACKLOG`, `OWNED`, `ALREADY_PLAYED`, `NEW_SUGGESTION`*

**Design decision required before Phase 4 — `NEW_SUGGESTION` ranking:**
When `includeNewSuggestions: true`, the service must suggest games not yet in the user's library. The ranking strategy needs to be defined. The intended approach is: pull games from the IGDB local cache that match the user's top genres and tags (derived from `TasteProfileService`), cross-reference against friends' libraries to surface socially validated picks, and rank by `communityRating` as a tiebreaker. Do not pull live from IGDB at request time — use only the local `games` table cache. This design must be confirmed and a `WhatToPlayService` skeleton must be written before building `WhatToPlayPageComponent`.

---

## 13. Daily Challenge Endpoints

### GET `/api/v1/challenge/today`

**Auth:** Protected  
**Description:** Get today's challenge. If the user has already completed it, returns the result instead.

**Response `200` — not yet completed:**

```json
{
  "id": "uuid",
  "challengeDate": "2025-03-25",
  "challengeType": "TBD",
  "payload": {},
  "completed": false,
  "friendCompletedCount": 2
}
```

**Response `200` — already completed:**

```json
{
  "id": "uuid",
  "challengeDate": "2025-03-25",
  "challengeType": "TBD",
  "completed": true,
  "result": {
    "score": 85,
    "shareText": "LevelUp Daily #42 — 85/100",
    "completedAt": "2025-03-25T09:15:00Z"
  },
  "friendScores": [
    { "username": "player2", "score": 90, "completedAt": "2025-03-25T08:00:00Z" },
    { "username": "player3", "score": 70, "completedAt": "2025-03-25T11:30:00Z" }
  ]
}
```

---

### POST `/api/v1/challenge/today/submit`

**Auth:** Protected  
**Description:** Submit the user's answer for today's challenge. Can only be called once per day.

**Request body:**

```json
{
  "answer": {}
}
```

*Note: The shape of `answer` depends on the TBD challenge mechanic. The `JSONB` payload field accommodates any structure.*

**Response `200`:**

```json
{
  "score": 85,
  "shareText": "LevelUp Daily #42 — 85/100",
  "completedAt": "2025-03-25T09:15:00Z",
  "friendScores": [
    { "username": "player2", "score": 90, "completedAt": "2025-03-25T08:00:00Z" }
  ]
}
```

**Errors:** `409` already submitted today

---

### GET `/api/v1/challenge/history`

**Auth:** Protected  
**Description:** Get the current user's challenge history — scores, dates, and streak data. Used to render the calendar heatmap on the profile.

**Query params:** `?page=0&size=30`

**Response `200`:**

```json
{
  "currentStreak": 5,
  "longestStreak": 12,
  "totalCompleted": 34,
  "history": {
    "content": [
      {
        "challengeDate": "2025-03-25",
        "score": 85,
        "completedAt": "2025-03-25T09:15:00Z"
      }
    ],
    "page": 0,
    "size": 30,
    "totalElements": 34,
    "totalPages": 2,
    "last": false
  }
}
```

---

## 14. Settings Endpoints

### PATCH `/api/v1/settings/account`

**Auth:** Protected  
**Description:** Update account credentials — username, email, or password.

**Request body** *(all fields optional, `currentPassword` required when changing password):*

```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response `200`:** Updated user object.

**Errors:** `400` validation failed, `401` wrong current password, `409` username or email taken

---

### PATCH `/api/v1/settings/privacy`

**Auth:** Protected  
**Description:** Update privacy preferences.

**Request body** *(all fields optional):*

```json
{
  "libraryVisibility": "FRIENDS",
  "wishlistVisibility": "FRIENDS",
  "reviewsVisibility": "PUBLIC"
}
```

*Visibility values: `PUBLIC`, `FRIENDS`, `PRIVATE`*

**Response `200`:**

```json
{
  "libraryVisibility": "FRIENDS",
  "wishlistVisibility": "FRIENDS",
  "reviewsVisibility": "PUBLIC"
}
```

---

LevelUp — API Endpoint Design — v3.0

---

### Changelog (v5.0)

- Slimmed auth response shape (`/auth/register`, `/auth/login`, `/auth/refresh`) — removed `bio`, `createdAt`, `libraryCount`, `completedCount`, `reviewCount`; auth responses now carry only session-boot fields (`id`, `username`, `email`, `avatarUrl`, `onboardingCompleted`); full profile data is fetched via `GET /users/me`
- Renamed `token` → `accessToken` in all auth response shapes to match implementation
- Removed rating mutation side effect from `POST /games/:gameId/reviews` — `rating` is no longer accepted in the request body; ratings are set exclusively via `PATCH /library/:entryId`
- Merged two onboarding endpoints into one — `POST /users/me/onboarding` now accepts `favouriteGenres`, `platforms`, and `seededGameIds` atomically; removed `POST /users/me/onboarding/preferences`
- Added `communityRating` null-threshold note to game detail endpoint — `communityRating` is `null` when fewer than 3 ratings exist
- Added `409` convention note to section 1 — clarifies when to use `409` vs `400`
- Added `totalPages` convenience-field note to pagination envelope

### Changelog (v4.0)

- Added `POST /users/me/onboarding/preferences` endpoint — missing step for submitting genre preferences during onboarding step 2; must be called before the completion endpoint *(superseded by v5.0 onboarding merge)*
- Clarified collection visibility — `isPublic` per-collection boolean governs collection access; `wishlistVisibility` governs WISHLIST-status library entries only; these are separate mechanisms

### Changelog (v3.0)

- Fixed auth responses (`/auth/register`, `/auth/login`, `/auth/refresh`) — added missing `libraryCount`, `completedCount`, `reviewCount`, and `onboardingCompleted` fields to `user` object; all three must return the full `User` shape
- Added privacy enforcement documentation to `GET /users/:username/reviews` — covers `reviewsVisibility`, `libraryVisibility`, and `wishlistVisibility`; service layer returns `200` with empty list rather than `403` for restricted content
- Added `RATING_ADDED` feed event deduplication rule — 24-hour window per user + game combination; update existing event metadata instead of creating duplicates
- Added `WhatToPlay` `NEW_SUGGESTION` design decision note — local cache only, ranked by taste profile + friend cross-reference + communityRating

### Changelog (v2.0)

- Added refresh token endpoints (`POST /auth/refresh`, `POST /auth/logout`)
- Added HttpOnly cookie notes on login/register responses
- Added avatar upload endpoint (`POST /users/me/avatar`)
- Added account deletion endpoint (`DELETE /users/me`) with soft delete
- Added user game profiles CRUD endpoints (`/users/me/game-profiles`)
- Fixed review body to be required (standalone ratings use library entries)
- Added note on review rating sourcing from library entries
- Fixed platform field to array (`platforms`) on all library endpoints
- Paginated the collections list endpoint
- Added platform filter to What to Play Next request
- Updated friend endpoints documentation for dual-row friendship model
- Added feed event retention note (90-day cleanup)
