import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';


export const onboardingGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  if (!userService.currentUser()?.onboardingCompleted) {
    return router.parseUrl('/onboarding');
  }
  return true;

};
