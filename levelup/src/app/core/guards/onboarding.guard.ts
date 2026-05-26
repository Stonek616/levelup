import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const onboardingGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user = userService.currentUser();
  if (user && !user.onboardingCompleted) {
    return router.createUrlTree(['/onboarding']);
  }
  return true;
};
