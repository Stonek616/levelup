import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

function retryWithFreshToken(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  originalError: unknown,
): Observable<HttpEvent<unknown>> {
  return authService.refreshSession().pipe(
    switchMap(() => {
      const newToken = authService.getToken();
      if (!newToken) {
        return throwError(() => originalError);
      }
      const retryReq = req.clone({
        setHeaders: { Authorization: `Bearer ${newToken}` },
      });
      return next(retryReq);
    }),
    catchError((retryError) => {
      if (retryError.status === 401) {
        authService.logout();
      }
      return throwError(() => retryError);
    }),
  );
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return retryWithFreshToken(req, next, authService, error);
      }
      return throwError(() => error);
    }),
  );
};
