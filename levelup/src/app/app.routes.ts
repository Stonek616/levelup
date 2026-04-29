import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';
import { LandingPageComponent } from './features/auth/landing-page/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
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
    path: '**',
    redirectTo: '',
  },
];
