import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent,
      ),
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
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password-page/forgot-password-page.component').then(
        (m) => m.ForgotPasswordPageComponent,
      ),
    canActivate: [guestGuard],
  },

  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password-page/reset-password-page.component').then(
        (m) => m.ResetPasswordPageComponent,
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

  {
    path: 'library',
    loadComponent: () =>
      import('./features/library/library-page/library-page.component').then(
        (m) => m.LibraryPageComponent,
      ),
    canActivate: [authGuard, onboardingGuard],
  },
  {
    path: 'game/:slug',
    loadComponent: () =>
      import('./features/library/game-detail-page/game-detail-page.component').then(
        (m) => m.GameDetailPageComponent,
      ),
  },
  {
    path: 'profile/:username',
    loadComponent: () =>
      import('./features/profile/profile-page/profile-page.component').then(
        (m) => m.ProfilePageComponent,
      ),
  },
  {
    path: 'profile/:username/library',
    loadComponent: () =>
      import('./features/profile/user-library-page/user-library-page.component').then(
        (m) => m.UserLibraryPageComponent,
      ),
  },
  {
    path: 'reviews/:id',
    loadComponent: () =>
      import('./features/review/review-detail-page/review-detail-page.component').then(
        (m) => m.ReviewDetailPageComponent,
      ),
  },
  {
    path: 'collections/:id',
    loadComponent: () =>
      import('./features/collections/collection-detail-page/collection-detail-page.component').then(
        (m) => m.CollectionDetailPageComponent,
      ),
  },

  {
    path: 'friends',
    loadComponent: () =>
      import('./features/friends/friends-page/friends-page.component').then(
        (m) => m.FriendsPageComponent,
      ),
    canActivate: [authGuard, onboardingGuard],
  },

  {
    path: 'what-to-play',
    loadComponent: () =>
      import('./features/what-to-play/what-to-play-page/what-to-play-page.component').then(
        (m) => m.WhatToPlayPageComponent,
      ),
    canActivate: [authGuard, onboardingGuard],
  },

  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding-page/onboarding-page.component').then(
        (m) => m.OnboardingPageComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings-page/settings-page.component').then(
        (m) => m.SettingsPageComponent,
      ),
    canActivate: [authGuard, onboardingGuard],
  },

  {
    path: 'admin/reports',
    loadComponent: () =>
      import('./features/admin/admin-reports-page/admin-reports-page.component').then(
        (m) => m.AdminReportsPageComponent,
      ),
    canActivate: [authGuard, adminGuard],
  },

  {
    path: 'not-found',
    loadComponent: () =>
      import('./features/not-found/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
  },

  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
  },
];
