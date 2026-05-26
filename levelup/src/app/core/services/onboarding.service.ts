import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OnboardingRequest,
  MessageResponse,
  AuthUser,
} from '../models/user.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  complete(request: OnboardingRequest): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(
        `${environment.apiUrl}/users/me/onboarding`,
        request,
      )
      .pipe(
        tap(() => {
          const current = this.userService.currentUser();
          if (current) {
            this.userService.setUser({
              ...current,
              onboardingCompleted: true,
            } as AuthUser);
          }
        }),
      );
  }
}
