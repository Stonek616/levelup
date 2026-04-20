# LevelUp — Angular Project Structure

**Version:** 2.0
**Angular:** 17+
**Pattern:** Standalone components, functional guards, Angular Signals
**Node:** 20+

---

## Table of Contents

1. [Project setup commands](#1-project-setup-commands)
2. [Folder structure](#2-folder-structure)
3. [Environment configuration](#3-environment-configuration)
4. [app.config.ts](#4-appconfigts)
5. [HttpClient & interceptors](#5-httpclient--interceptors)
6. [Signal-based service pattern](#6-signal-based-service-pattern)
7. [AppComponent initialisation sequence](#7-appcomponent-initialisation-sequence)
8. [Angular CLI generation cheatsheet](#8-angular-cli-generation-cheatsheet)
9. [Proxy configuration for local development](#9-proxy-configuration-for-local-development)

---

## 1. Project Setup Commands

Run these in order to scaffold the project from scratch.

```bash
# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli

# Create the project — standalone components, no SSR, SCSS
ng new levelup --standalone --routing --style=scss --no-ssr

cd levelup

# Verify it runs
ng serve
```

---

## 2. Folder Structure

The complete intended folder structure for `src/app/`. Create feature folders as you build each phase — you do not need all of these on day one.

```text
src/ 
├── app/
│   │
│   ├── core/                              ← Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── guest.guard.ts
│   │   │   └── onboarding.guard.ts
│   │   ├── interceptors/
│   │   │   ├── jwt.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── game.service.ts
│   │   │   ├── library.service.ts
│   │   │   ├── review.service.ts
│   │   │   ├── comment.service.ts
│   │   │   ├── friend.service.ts
│   │   │   ├── feed.service.ts
│   │   │   ├── discovery.service.ts
│   │   │   ├── collection.service.ts
│   │   │   ├── challenge.service.ts
│   │   │   ├── taste-profile.service.ts
│   │   │   └── toast.service.ts
│   │   └── models/                        ← TypeScript interfaces (see models document)
│   │       ├── user.model.ts
│   │       ├── game.model.ts
│   │       ├── game-profile.model.ts
│   │       ├── library-entry.model.ts
│   │       ├── review.model.ts
│   │       ├── friend.model.ts
│   │       ├── feed-event.model.ts
│   │       ├── collection.model.ts
│   │       ├── challenge.model.ts
│   │       ├── discovery.model.ts
│   │       ├── what-to-play.model.ts
│   │       ├── api-response.model.ts
│   │       └── enums.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── landing-page/
│   │   │   │   ├── landing-page.component.ts
│   │   │   │   ├── landing-page.component.html
│   │   │   │   └── landing-page.component.scss
│   │   │   ├── login-page/
│   │   │   ├── register-page/
│   │   │   ├── forgot-password-page/
│   │   │   └── onboarding-page/
│   │   │       ├── onboarding-page.component.ts
│   │   │       ├── onboarding-page.component.html
│   │   │       ├── onboarding-page.component.scss
│   │   │       ├── onboarding-search-step/
│   │   │       └── onboarding-prefs-step/
│   │   │
│   │   ├── discover/
│   │   │   ├── feed-page/
│   │   │   ├── feed-view-switcher/
│   │   │   ├── trending-feed/
│   │   │   ├── friends-feed/
│   │   │   ├── for-you-feed/
│   │   │   ├── similar-feed/
│   │   │   └── new-notable-feed/
│   │   │
│   │   ├── library/
│   │   │   ├── library-page/
│   │   │   ├── library-toolbar/
│   │   │   ├── library-grid/
│   │   │   └── game-detail-page/
│   │   │       ├── game-hero/
│   │   │       ├── user-game-actions/
│   │   │       ├── friend-ratings/
│   │   │       └── game-reviews/
│   │   │
│   │   ├── review/
│   │   │   └── review-detail-page/
│   │   │       ├── review-body/
│   │   │       └── review-comments/
│   │   │
│   │   ├── friends/
│   │   │   └── friends-page/
│   │   │       ├── friend-list/
│   │   │       ├── pending-requests/
│   │   │       └── find-friends/
│   │   │
│   │   ├── profile/
│   │   │   └── profile-page/
│   │   │       ├── profile-header/
│   │   │       ├── taste-profile/
│   │   │       ├── recent-activity/
│   │   │       ├── collections-preview/
│   │   │       ├── challenge-history/
│   │   │       ├── friend-library/           ← Conditional — only rendered when isFriend === true
│   │   │       └── shared-games/             ← Conditional — only rendered when isFriend === true
│   │   │
│   │   ├── collections/
│   │   │   └── collection-detail-page/
│   │   │       ├── collection-header/
│   │   │       └── collection-grid/
│   │   │
│   │   ├── what-to-play/
│   │   │   └── what-to-play-page/
│   │   │       ├── prompt-step/
│   │   │       └── suggestions-result/
│   │   │
│   │   ├── daily-challenge/
│   │   │   └── challenge-page/
│   │   │       ├── challenge-active/
│   │   │       ├── challenge-result/
│   │   │       └── friend-scores/
│   │   │
│   │   ├── settings/
│   │   │   ├── settings-page/
│   │   │   ├── account-settings/
│   │   │   ├── privacy-settings/
│   │   │   ├── game-profiles/             ← Manage linked platform profiles (PSN, Xbox, Steam)
│   │   │   └── danger-zone/               ← Account deletion (soft delete)
│   │   │
│   │   └── not-found/
│   │       └── not-found-page.component.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── navbar/
│   │   │   │   ├── navbar.component.ts
│   │   │   │   ├── navbar.component.html
│   │   │   │   └── navbar.component.scss
│   │   │   ├── game-card/
│   │   │   ├── status-badge/
│   │   │   ├── status-picker/
│   │   │   ├── owned-toggle/
│   │   │   ├── rating-stars/
│   │   │   ├── avatar/
│   │   │   ├── user-card/
│   │   │   ├── review-card/
│   │   │   ├── feed-item/
│   │   │   ├── game-search-input/
│   │   │   ├── empty-state/
│   │   │   ├── loading-skeleton/
│   │   │   ├── confirm-dialog/
│   │   │   └── toast/
│   │   └── pipes/
│   │       ├── time-ago.pipe.ts
│   │       ├── truncate.pipe.ts
│   │       └── status-label.pipe.ts
│   │
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   └── app.routes.ts
│
├── environments/
│   ├── environment.ts                     ← Development environment
│   └── environment.prod.ts               ← Production environment
│
├── index.html
├── main.ts
└── styles.scss                            ← Global styles, CSS custom properties
```

---

## 3. Environment Configuration

`src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
};
```

`src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-railway-app.railway.app/api/v1',
};
```

---

## 4. app.config.ts

This is the root application configuration for standalone Angular. It replaces `AppModule`.

`src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor])
    ),
  ],
};
```

`withComponentInputBinding()` allows route params to be passed directly as component `@Input()` properties — very useful for reading `:id` and `:username` without injecting `ActivatedRoute`.

---

## 5. HttpClient & Interceptors

### JWT Interceptor

`src/app/core/interceptors/jwt.interceptor.ts`

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Always send withCredentials for cookie-based refresh token
  let cloned = req.clone({ withCredentials: true });

  if (token) {
    cloned = cloned.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(cloned);
};
```

### Error Interceptor

`src/app/core/interceptors/error.interceptor.ts`

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        // Access token expired — attempt silent refresh, then retry
        return authService.refreshSession().pipe(
          switchMap(result => {
            if (result) {
              // Retry the original request with the new token
              const retried = req.clone({
                setHeaders: { Authorization: `Bearer ${authService.getToken()}` },
                withCredentials: true
              });
              return next(retried);
            }
            // Refresh failed — redirect to login
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
```

---

## 6. Signal-Based Service Pattern

This is the pattern used for every service in the app. Study this carefully — it replaces NgRx for all state management needs at this scale.

`src/app/core/services/auth.service.ts` — abbreviated example showing the pattern:

```typescript
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Access token stored in memory only — never localStorage (XSS protection)
  // Refresh token is in an HttpOnly cookie managed by the browser
  private readonly _token = signal<string | null>(null);

  // Public read-only computed — components read this
  readonly isAuthenticated = computed(() => !!this._token());

  // Track whether we've attempted to restore the session
  private readonly _initialized = signal(false);
  readonly initialized = this._initialized.asReadonly();

  login(request: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, request,
        { withCredentials: true })  // send/receive HttpOnly cookies
      .pipe(
        tap(response => {
          this._token.set(response.token);
        })
      );
  }

  register(request: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, request,
        { withCredentials: true })
      .pipe(
        tap(response => {
          this._token.set(response.token);
        })
      );
  }

  /**
   * Called on app startup to restore session from refresh token cookie.
   * Returns an observable that completes after the attempt.
   */
  refreshSession() {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {},
        { withCredentials: true })
      .pipe(
        tap(response => {
          this._token.set(response.token);
          this._initialized.set(true);
        }),
        catchError(() => {
          this._token.set(null);
          this._initialized.set(true);
          return of(null);
        })
      );
  }

  logout() {
    this.http.post(`${environment.apiUrl}/auth/logout`, {},
      { withCredentials: true }).subscribe();
    this._token.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this._token();
  }
}
```

**Key rules for this pattern:**

- Private `signal()` for writable state — only the service mutates it
- Public `computed()` for derived state — components read, never write
- Components call service methods — they never call `signal.set()` directly
- Use `inject()` inside the class body — no constructor injection needed in standalone
- Access tokens are stored in memory (signal), never in `localStorage` — protects against XSS
- Refresh tokens live in HttpOnly cookies — the browser handles storage and transmission
- On app startup, `refreshSession()` is called to silently restore the session from the cookie
- All API calls that send/receive cookies must include `{ withCredentials: true }`

---

## 7. AppComponent Initialisation Sequence

The `AppComponent` is responsible for restoring the session on app startup. Guards depend on this being complete before they run — if the order is wrong, `onboardingGuard` will wait forever for a `currentUser` that never loads.

The required sequence on app load is:

```text
1. AppComponent.ngOnInit() calls AuthService.refreshSession()
2. refreshSession() calls POST /api/v1/auth/refresh
   ├── Success → sets the access token in memory + sets initialized = true
   │            → the auth response includes the full User object
   │            → AuthService calls UserService.setCurrentUser(response.user)
   └── Failure → sets token to null + sets initialized = true
                 → UserService is not populated (user stays null / unauthenticated)
3. authGuard watches initialized signal — unblocks once initialized = true
4. onboardingGuard watches UserService.currentUser signal — unblocks once user != null
```

`AppComponent.ngOnInit()` implementation sketch:

```typescript
ngOnInit() {
  this.authService.refreshSession().subscribe(response => {
    if (response) {
      this.userService.setCurrentUser(response.user);
    }
  });
}
```

`UserService` must expose a `setCurrentUser()` method (called by `AppComponent` after session restore) and a `currentUser` signal (read by `onboardingGuard`). `UserService` does not fetch the user itself — it receives the user object from the auth response.

---

## 8. Angular CLI Generation Cheatsheet

Use these commands to generate files consistently. The `--skip-tests` flag is optional — remove it if you want test files.

```bash
# Generate a standalone component (use for everything)
ng generate component features/auth/login-page/login-page --skip-tests

# Generate a service
ng generate service core/services/auth --skip-tests

# Generate a guard (functional)
ng generate guard core/guards/auth --functional --skip-tests

# Generate a pipe
ng generate pipe shared/pipes/time-ago --skip-tests

# Generate an interceptor
ng generate interceptor core/interceptors/jwt --skip-tests

# Shorter aliases work too
ng g c features/library/library-page/library-page --skip-tests
ng g s core/services/library --skip-tests
```

**Important:** Always generate from the `src/app/` root perspective when running the CLI — Angular resolves paths relative to the project root.

---

## 9. Proxy Configuration for Local Development

Without this, your Angular dev server (port 4200) will get CORS errors calling your Spring Boot API (port 8080) during development.

Create `src/proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Update `angular.json` — find the `"serve"` section and add the proxy config:

```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "proxyConfig": "src/proxy.conf.json"
  }
}
```

With this in place, `http://localhost:4200/api/v1/auth/login` in Angular automatically proxies to `http://localhost:8080/api/v1/auth/login`. Your `environment.ts` `apiUrl` can simply be `/api/v1` in development, removing the need for the full localhost URL.

---

LevelUp — Angular Project Structure — v2.0

---

### Changelog (v3.0)

- Removed `friend-profile-page/` from `features/friends/` — `FriendProfilePageComponent` is eliminated
- Moved `FriendLibraryComponent` and `SharedGamesComponent` into `features/profile/profile-page/` as conditional sub-components (render only when `isFriend === true`)
- Fixed error interceptor missing `switchMap` import — added to rxjs import alongside `catchError` and `throwError`

### Changelog (v2.0)

- Replaced localStorage token storage with in-memory signal (XSS protection)
- Added refresh token flow using HttpOnly cookies
- Added `refreshSession()` to AuthService for silent session restore on app load
- Updated JWT interceptor to include `withCredentials: true` on all requests
- Updated error interceptor to attempt token refresh on 401 before forcing logout
- Added `game-profile.model.ts` and `what-to-play.model.ts` to model file list
- Added game-profiles and danger-zone components to settings feature
