import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';


export const routes: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/landing-page/landing-page.component')
        .then(m => m.LandingPageComponent),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
    canActivate: [guestGuard],
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register-page/register-page.component').then(
        (m) => m.RegisterPageComponent,
      ),
    canActivate: [guestGuard],
  },

  {
    path: 'feed',
    loadComponent: () =>
      import('./features/feed/feed-page/feed-page.component').then(
        (m) => m.FeedPageComponent,
      ),
    canActivate: [authGuard, onboardingGuard],
  },

  /*
    {
        path: 'onboarding',
        loadComponent: () => import('./features/onboarding/onboarding.component')
            .then(m => m.OnboardingComponent),
        canActivate: [authGuard]
    },
    */
  {
    path: 'library',
    loadComponent: () =>
      import('./features/library/library-page/library-page.component').then(
        (m) => m.LibraryPageComponent,
      ),
    canActivate: [authGuard, onboardingGuard],
  },
  {
    path: 'game/:id',
    loadComponent: () =>
      import('./features/library/game-detail-page/game-detail-page.component').then(
        (m) => m.GameDetailPageComponent,
      )
  },
  {
    path: 'profile/:username',
    loadComponent: () =>
      import('./features/profile/profile-page/profile-page.component')
        .then(m => m.ProfilePageComponent)
  },
  {
    path: 'reviews/:id',
    loadComponent: () =>
      import('./features/review/review-detail-page/review-detail-page.component').then(
        (m) => m.ReviewDetailPageComponent,
      )
  },
  {
    path: 'collections/:id',
    loadComponent: () =>
      import('./features/collections/collection-detail-page/collection-detail-page.component')
        .then(m => m.CollectionDetailPageComponent)
  },

  {
    path: 'friends',
    loadComponent: () =>
      import('./features/friends/friends-page/friends-page.component')
        .then(m => m.FriendsPageComponent),
    canActivate: [authGuard, onboardingGuard]
  },

  {
    path: 'what-to-play',
    loadComponent: () =>
      import('./features/what-to-play/what-to-play-page/what-to-play-page.component')
        .then(m => m.WhatToPlayPageComponent),
    canActivate: [authGuard, onboardingGuard]
  },

  {
    path: '**',
    redirectTo: '',
  },
];
