# LevelUp — Frontend Routing Document

**Version:** 2.0
**Framework:** Angular 17+ (standalone components, functional guards)
**State:** Angular Signals
**File:** `src/app/app.routes.ts`

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Route guards](#2-route-guards)
3. [Full route table](#3-full-route-table)
4. [Route definitions — annotated](#4-route-definitions--annotated)
5. [Redirect logic](#5-redirect-logic)
6. [Route parameters & query params](#6-route-parameters--query-params)
7. [Navigation flows](#7-navigation-flows)
8. [app.routes.ts — full file](#8-approutests--full-file)

---

## 1. Conventions

### Lazy loading

Every feature module is lazy loaded using `loadComponent()` (standalone component pattern). Nothing is eagerly loaded except the root `AppComponent` shell and the `NavbarComponent`.

### Guard application

Guards are applied as `canActivate` arrays on route definitions using Angular's functional guard pattern — no class-based guards.

```typescript
// Functional guard pattern used throughout
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated()
    ? true
    : router.createUrlTree(['/login']);
};
```

### Naming conventions

- Route paths use `kebab-case`
- Component files use `PascalCase.component.ts`
- Feature folders match route segment names exactly

---

## 2. Route Guards

### `authGuard`

**File:** `src/app/core/guards/auth.guard.ts`
**Purpose:** Blocks access to routes that require a logged-in user.
**Behaviour:** Waits for `AuthService.initialized` to be true (session restore complete), then checks authentication. If no valid token → redirect to `/login` with `returnUrl` query param.

```text
Session not yet restored → wait for refreshSession() to complete
No token after restore → /login?returnUrl=/library
Valid token → allow
```

---

### `guestGuard`

**File:** `src/app/core/guards/guest.guard.ts`  
**Purpose:** Prevents authenticated users from accessing auth pages.  
**Behaviour:** If valid JWT exists → redirect to `/feed`.

```text
Valid token → /feed
No token → allow
```

---

### `onboardingGuard`

**File:** `src/app/core/guards/onboarding.guard.ts`
**Purpose:** Forces new users through onboarding before accessing the main app.
**Behaviour:** Waits for user data to be loaded before checking. If authenticated but `onboardingCompleted === false` → redirect to `/onboarding`. Applied on all protected routes except `/onboarding` itself.

```text
User data not yet loaded → wait for UserService to resolve
Authenticated + onboarding incomplete → /onboarding
Authenticated + onboarding complete → allow
Not authenticated → authGuard handles it first
```

---

### Guard execution order

Guards in `canActivate` arrays execute left to right. The order on protected routes is always:

```text
[authGuard, onboardingGuard]
```

`authGuard` runs first — if the user is not authenticated there is no point checking onboarding status.

---

## 3. Full Route Table

| Path | Component | Auth | Guard(s) | Notes |
| --- | --- | --- | --- | --- |
| `/` | `LandingPageComponent` | Public | `guestGuard` | Redirects authenticated users to `/feed` |
| `/login` | `LoginPageComponent` | Public | `guestGuard` | Redirects authenticated users to `/feed` |
| `/register` | `RegisterPageComponent` | Public | `guestGuard` | Redirects authenticated users to `/feed` |
| `/forgot-password` | `ForgotPasswordPageComponent` | Public | `guestGuard` | |
| `/onboarding` | `OnboardingPageComponent` | Protected | `authGuard` | No `onboardingGuard` — this IS onboarding |
| `/feed` | `FeedPageComponent` | Protected | `authGuard`, `onboardingGuard` | Logged-in home |
| `/library` | `LibraryPageComponent` | Protected | `authGuard`, `onboardingGuard` | Current user's library |
| `/game/:id` | `GameDetailPageComponent` | Public | none | Game visible to all; actions require auth |
| `/review/:id` | `ReviewDetailPageComponent` | Public | none | Review visible to all; write actions require auth |
| `/profile/:username` | `ProfilePageComponent` | Public | none | Public profile — renders conditionally based on auth state and friendship status |
| `/friends` | `FriendsPageComponent` | Protected | `authGuard`, `onboardingGuard` | Friend list + find friends |
| `/collections/:id` | `CollectionDetailPageComponent` | Public | none | Public collections visible without login |
| `/what-to-play` | `WhatToPlayPageComponent` | Protected | `authGuard`, `onboardingGuard` | |
| `/challenge` | `ChallengePageComponent` | Protected | `authGuard`, `onboardingGuard` | Today's daily challenge |
| `/settings` | `SettingsPageComponent` | Protected | `authGuard`, `onboardingGuard` | |
| `/settings/account` | `AccountSettingsComponent` | Protected | `authGuard`, `onboardingGuard` | Child route of settings |
| `/settings/privacy` | `PrivacySettingsComponent` | Protected | `authGuard`, `onboardingGuard` | Child route of settings |
| `/settings/game-profiles` | `GameProfilesComponent` | Protected | `authGuard`, `onboardingGuard` | Child route of settings |
| `/settings/danger-zone` | `DangerZoneComponent` | Protected | `authGuard`, `onboardingGuard` | Child route of settings — account deletion |
| `**` | `NotFoundPageComponent` | Public | none | 404 catch-all — always last |

---

## 4. Route Definitions — Annotated

### Public routes (no auth required)

#### `/` — Landing page

- Served to logged-out visitors
- `guestGuard` redirects authenticated users to `/feed`
- Shows trending games, community activity preview, sign up CTA
- This is the primary acquisition surface

#### `/login` and `/register`

- `guestGuard` on both — an authenticated user has no reason to be here
- On successful login/register, redirect to `returnUrl` query param if present, otherwise `/feed`
- On successful register, redirect to `/onboarding` before `/feed`

#### `/game/:id`

- Fully public — game detail pages are browsable without an account
- This supports the SEO and acquisition goal — users can land here from search
- The `UserGameActionsComponent` (status picker, rating) renders only when authenticated
- The `FriendRatingsComponent` renders only when authenticated and has friends

#### `/review/:id`

- Fully public — reviews are readable without an account
- Comment compose form renders only when authenticated
- Like buttons render only when authenticated

#### `/profile/:username`

This is the single canonical profile route — it serves all users (self, friend, stranger, logged-out visitor) and renders in three conditional layers:

##### **Layer 1 — Always visible (public)**

- Bio, avatar, public stats (libraryCount, completedCount, reviewCount)
- Public reviews, public collections
- Taste profile

##### **Layer 2 — Authenticated only**

- Friendship status badge
- Add Friend / Request Pending / Friends button
- Compatibility score (when authenticated and friendship is confirmed)

##### **Layer 3 — Friends only**

- "Their Library" tab — renders `FriendLibraryComponent` only when `isFriend === true`; calls `GET /api/v1/users/:username/library` which respects the friend's privacy settings
- "Games We Both Own" CTA — opens `SharedGamesComponent`; calls `GET /api/v1/library/shared/:username`
- The user stays on `/profile/:username` while browsing the friend's library — no navigation to a separate route

##### **Self-view behaviour**

- When `username` matches the current user, the Add Friend button is hidden and the library link points to `/library`

The component calls `GET /api/v1/users/:username` first. That response includes `isFriend` and `friendRequestStatus`. The friend library and shared games calls are made conditionally based on that response.

#### `/collections/:id`

- Public for collections marked `isPublic: true`
- Private collections return a `403` from the API — frontend shows an access denied state
- No guard on the route itself — the API enforces visibility

---

### Protected routes (auth + onboarding required)

#### `/onboarding`

- `authGuard` only — no `onboardingGuard` (would cause infinite redirect loop)
- Two-step flow rendered as child components within the page component
- On completion calls `POST /api/v1/users/me/onboarding` then navigates to `/feed`
- If user navigates here after completing onboarding, redirect to `/feed`

#### `/feed`

- Logged-in home screen
- Default landing after login for users who have completed onboarding
- Contains the `FeedViewSwitcherComponent` — tab state managed in URL via query param `?view=trending`

#### `/library`

- Current user's library only — to view a friend's library, navigate to `/profile/:username` and open the "Their Library" tab
- Filter and sort state persisted in URL query params: `?status=PLAYING&owned=true&platforms=PC&sort=updatedAt,desc`
- Allows deep-linking to a filtered view

#### `/settings`

- Redirects to `/settings/account` by default via `redirectTo`
- Child routes render inside a settings layout with a side nav

#### `/challenge`

- Renders `ChallengeActiveComponent` if today's challenge is not yet completed
- Renders `ChallengeResultComponent` + `FriendScoresComponent` if already completed
- State determined on page load by calling `GET /api/v1/challenge/today`

---

## 5. Redirect Logic

```text
User visits /
├── Authenticated + onboarding complete → /feed
├── Authenticated + onboarding incomplete → /onboarding
└── Not authenticated → show LandingPageComponent

User visits /login or /register
├── Authenticated → /feed
└── Not authenticated → show page

User visits any protected route (e.g. /library)
├── Not authenticated → /login?returnUrl=/library
├── Authenticated + onboarding incomplete → /onboarding
└── Authenticated + onboarding complete → show page

User visits /onboarding
├── Not authenticated → /login
├── Authenticated + onboarding complete → /feed
└── Authenticated + onboarding incomplete → show page

User visits unknown path
└── /404 (NotFoundPageComponent via ** catch-all)
```

---

## 6. Route Parameters & Query Params

### Route parameters (`:param`)

| Route | Param | Type | Source |
| --- | --- | --- | --- |
| `/game/:id` | `id` | UUID string | Local `games` table UUID |
| `/review/:id` | `id` | UUID string | Local `reviews` table UUID |
| `/profile/:username` | `username` | string | User's username |
| `/collections/:id` | `id` | UUID string | Local `collections` table UUID |

### Query params (persisted in URL for shareability/deep linking)

| Route | Param | Values | Purpose |
| --- | --- | --- | --- |
| `/feed` | `view` | `trending`, `friends`, `for-you`, `similar`, `new` | Active feed tab |
| `/library` | `status` | `WISHLIST`, `BACKLOG`, `PLAYING`, `PLAYED`, `FINISHED`, `COMPLETED`, `ABANDONED` | Status filter |
| `/library` | `owned` | `true`, `false` | Owned flag filter |
| `/library` | `platforms` | `PC`, `PS5`, `Switch`, etc. | Platform filter |
| `/library` | `sort` | `updatedAt,desc`, `title,asc`, `rating,desc` | Sort order |
| `/login` | `returnUrl` | any valid path | Post-login redirect destination |
| `/register` | `returnUrl` | any valid path | Post-register redirect destination |

### Reading params in components

```typescript
// Route param — inject ActivatedRoute
readonly route = inject(ActivatedRoute);
readonly gameId = this.route.snapshot.paramMap.get('id');

// Query param — use signal-based approach
readonly queryParams = toSignal(this.route.queryParamMap);
readonly activeView = computed(() =>
  this.queryParams()?.get('view') ?? 'trending'
);
```

---

## 7. Navigation Flows

### New user registration flow

```text
/register
  → POST /api/v1/auth/register
  → navigate to /onboarding
    → complete search step (seed library)
    → complete preferences step (seed taste profile)
    → POST /api/v1/users/me/onboarding
  → navigate to /feed
```

### Login flow

```text
/login
  → POST /api/v1/auth/login
  → check returnUrl query param
    → if present → navigate to returnUrl
    → if absent → navigate to /feed
```

### Adding a game to library

```text
/feed or /game/:id
  → user clicks "Add to library"
  → GameSearchInputComponent (if from feed) or UserGameActionsComponent (if from detail)
  → StatusPickerComponent renders
  → POST /api/v1/library
  → optimistic UI update (update signal immediately, revert on error)
```

### Viewing shared games with a friend

```text
/friends
  → click friend card
  → /profile/:username
  → ProfilePageComponent loads (GET /api/v1/users/:username)
  → isFriend === true → "Their Library" tab becomes visible
  → FriendLibraryComponent loads (GET /api/v1/users/:username/library)
  → click "Games we both own"
  → SharedGamesComponent loads (GET /api/v1/library/shared/:username)
  → optional: filter by ?gameModes=multiplayer,co_op
  → user stays on /profile/:username throughout
```

### Daily challenge flow

```text
/challenge
  → GET /api/v1/challenge/today
  → if completed === false → render ChallengeActiveComponent
    → user completes challenge
    → POST /api/v1/challenge/today/submit
    → render ChallengeResultComponent with score + share text
    → render FriendScoresComponent
  → if completed === true → render result + friend scores directly
```

### What to play next flow

```text
/what-to-play
  → PromptStepComponent renders (platform → mood → multiplayer → options)
  → each step navigates forward on selection (no back needed — linear flow)
  → POST /api/v1/what-to-play
  → SuggestionsResultComponent renders with ranked list
  → clicking a suggestion navigates to /game/:id
  → "Try again" button resets to step 1
```

---

## 8. app.routes.ts — Full File

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';

export const routes: Routes = [

  // ── Public / auth routes ──────────────────────────────────────────────────

  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/landing-page/landing-page.component')
        .then(m => m.LandingPageComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login-page/login-page.component')
        .then(m => m.LoginPageComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register-page/register-page.component')
        .then(m => m.RegisterPageComponent),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password-page/forgot-password-page.component')
        .then(m => m.ForgotPasswordPageComponent),
  },

  // ── Onboarding ─────────────────────────────────────────────────────────────

  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/onboarding-page/onboarding-page.component')
        .then(m => m.OnboardingPageComponent),
  },

  // ── Public content routes (no auth — API enforces visibility) ─────────────

  {
    path: 'game/:id',
    loadComponent: () =>
      import('./features/library/game-detail-page/game-detail-page.component')
        .then(m => m.GameDetailPageComponent),
  },
  {
    path: 'review/:id',
    loadComponent: () =>
      import('./features/review/review-detail-page/review-detail-page.component')
        .then(m => m.ReviewDetailPageComponent),
  },
  {
    path: 'profile/:username',
    loadComponent: () =>
      import('./features/profile/profile-page/profile-page.component')
        .then(m => m.ProfilePageComponent),
  },
  {
    path: 'collections/:id',
    loadComponent: () =>
      import('./features/collections/collection-detail-page/collection-detail-page.component')
        .then(m => m.CollectionDetailPageComponent),
  },

  // ── Protected routes ───────────────────────────────────────────────────────

  {
    path: 'feed',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/discover/feed-page/feed-page.component')
        .then(m => m.FeedPageComponent),
  },
  {
    path: 'library',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/library/library-page/library-page.component')
        .then(m => m.LibraryPageComponent),
  },
  {
    path: 'friends',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/friends/friends-page/friends-page.component')
        .then(m => m.FriendsPageComponent),
  },
  {
    path: 'what-to-play',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/what-to-play/what-to-play-page/what-to-play-page.component')
        .then(m => m.WhatToPlayPageComponent),
  },
  {
    path: 'challenge',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/daily-challenge/challenge-page/challenge-page.component')
        .then(m => m.ChallengePageComponent),
  },

  // ── Settings (child routes) ────────────────────────────────────────────────

  {
    path: 'settings',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/settings/settings-page/settings-page.component')
        .then(m => m.SettingsPageComponent),
    children: [
      {
        path: '',
        redirectTo: 'account',
        pathMatch: 'full',
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./features/settings/account-settings/account-settings.component')
            .then(m => m.AccountSettingsComponent),
      },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./features/settings/privacy-settings/privacy-settings.component')
            .then(m => m.PrivacySettingsComponent),
      },
      {
        path: 'game-profiles',
        loadComponent: () =>
          import('./features/settings/game-profiles/game-profiles.component')
            .then(m => m.GameProfilesComponent),
      },
      {
        path: 'danger-zone',
        loadComponent: () =>
          import('./features/settings/danger-zone/danger-zone.component')
            .then(m => m.DangerZoneComponent),
      },
    ],
  },

  // ── 404 catch-all (always last) ────────────────────────────────────────────

  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page.component')
        .then(m => m.NotFoundPageComponent),
  },

];
```

---

## Guard implementations

### `auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for session restore to complete before checking auth
  if (!authService.initialized()) {
    return toObservable(authService.initialized).pipe(
      filter(initialized => initialized),
      take(1),
      map(() => {
        if (authService.isAuthenticated()) return true;
        const returnUrl = route.url.map(s => s.path).join('/');
        return router.createUrlTree(['/login'], {
          queryParams: { returnUrl: `/${returnUrl}` }
        });
      })
    );
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  const returnUrl = route.url.map(s => s.path).join('/');
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: `/${returnUrl}` }
  });
};
```

---

### `guest.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for session restore to complete before checking auth — same as authGuard.
  // Without this, a hard refresh to /login passes the guard immediately (isAuthenticated
  // is false before refreshSession() resolves), the user briefly sees the login page,
  // then gets redirected to /feed once the session restores.
  if (!authService.initialized()) {
    return toObservable(authService.initialized).pipe(
      filter(initialized => initialized),
      take(1),
      map(() =>
        authService.isAuthenticated()
          ? router.createUrlTree(['/feed'])
          : true
      )
    );
  }

  return authService.isAuthenticated()
    ? router.createUrlTree(['/feed'])
    : true;
};
```

---

### `onboarding.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const onboardingGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user = userService.currentUser();

  // If user data hasn't loaded yet, wait for it
  if (!user) {
    return toObservable(userService.currentUser).pipe(
      filter(u => u !== null),
      take(1),
      map(u => u!.onboardingCompleted
        ? true
        : router.createUrlTree(['/onboarding'])
      )
    );
  }

  return user.onboardingCompleted
    ? true
    : router.createUrlTree(['/onboarding']);
};
```

---

LevelUp — Frontend Routing Document — v2.0

---

### Changelog (v3.0)

- Removed `/friends/:username` route — consolidated into `/profile/:username` as a conditional "Their Library" tab
- `/profile/:username` now serves all users (self, friend, stranger, logged-out visitor) with three conditional render layers
- Removed `FriendProfilePageComponent` route; `FriendLibraryComponent` and `SharedGamesComponent` are now sub-components of `ProfilePageComponent`
- Removed `/friends/:username → /profile/:username` redirect rule (no longer needed — same route)
- Updated `/library` description to reflect friend library access via profile tabs
- Updated "Viewing shared games" navigation flow — user stays on `/profile/:username`
- Fixed `guestGuard` race condition — now waits for `authService.initialized()` before checking auth, matching `authGuard` behaviour
- `/friends` list page is unchanged — friend cards now link to `/profile/:username`

### Changelog (v2.0)

- Fixed auth guard to wait for session restore before checking authentication
- Fixed onboarding guard race condition — now waits for user data to load instead of returning true when user is null
- Updated guards to use `toObservable()` for async resolution
- Added settings child routes for game-profiles and danger-zone
- Updated library query param from `platform` to `platforms` (array)
