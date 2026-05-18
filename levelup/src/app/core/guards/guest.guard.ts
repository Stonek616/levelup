import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, take, filter } from 'rxjs';

export const guestGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.initialized).pipe(
    filter(initialized => initialized === true),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        return router.parseUrl('/feed');
      }
      return true
    })
  );
};
