import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UpdateAccountSettingsRequest,
  PrivacySettingsRequest,
  DeleteAccountRequest,
  GameProfile,
  CreateGameProfileRequest,
  MessageResponse,
} from '../models/user.model';
import { UserProfile } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  updateAccount(request: UpdateAccountSettingsRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${environment.apiUrl}/settings/account`, request).pipe(
      tap(updated => {
        const current = this.userService.currentUser();
        if (current) {
          this.userService.setUser({
            ...current,
            username: updated.username ?? current.username,
            avatarUrl: updated.avatarUrl ?? current.avatarUrl,
          });
        }
      })
    );
  }

  updatePrivacy(request: PrivacySettingsRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${environment.apiUrl}/settings/privacy`, request);
  }

  deleteAccount(request: DeleteAccountRequest): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${environment.apiUrl}/settings/account`, { body: request });
  }

  getGameProfiles(): Observable<GameProfile[]> {
    return this.http.get<GameProfile[]>(`${environment.apiUrl}/users/me/game-profiles`);
  }

  addGameProfile(request: CreateGameProfileRequest): Observable<GameProfile> {
    return this.http.post<GameProfile>(`${environment.apiUrl}/users/me/game-profiles`, request);
  }

  removeGameProfile(profileId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/me/game-profiles/${profileId}`);
  }
}
