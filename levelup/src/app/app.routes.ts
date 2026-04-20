import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';
import { LandingPageComponent } from './features/auth/landing-page/landing-page.component';
import { LoginPageComponent } from './features/auth/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/register-page/register-page.component';
import { FeedPageComponent } from './features/feed/feed-page/feed-page.component';
//import { OnboardingComponent } from './features/onboarding/onboarding.component';

export const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,

    },

    {
        path: 'login',
        component: LoginPageComponent,
        canActivate: [guestGuard]

    },

    {
        path: 'register',
        component: RegisterPageComponent,
        canActivate: [guestGuard]

    },
     
    {
        path: 'feed',
           component: FeedPageComponent,
           canActivate: [authGuard, onboardingGuard]
       },
   

    /*
    {
        path: 'onboarding',
        component: OnboardingComponent,
        canActivate: [authGuard]
    },
    */

    {
        path: '**',
        redirectTo: ''
    }
];
