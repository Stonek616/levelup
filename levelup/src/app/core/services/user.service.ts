import { Injectable, inject, signal } from '@angular/core';
import { AuthUser, GameProfile, UpdateProfileRequest, UserProfile, UserSearchResult} from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PagedResponse } from '../models/api-response.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private _currentUser = signal<AuthUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  setUser(user: AuthUser) {
    this._currentUser.set(user);
  }

  clearUser() {
    this._currentUser.set(null);
  }

  getProfile(username: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/users/${username}`);
  }

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/users/me`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${environment.apiUrl}/users/me`, request);
  }

  uploadAvatar(file: File): Observable<UserProfile> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<UserProfile>(`${environment.apiUrl}/users/me/avatar`, body);
  }

  deleteAvatar(): Observable<UserProfile> {
    return this.http.delete<UserProfile>(`${environment.apiUrl}/users/me/avatar`);
  }

  searchUsers(query: string): Observable<PagedResponse<UserSearchResult>> {
    return this.http.get<PagedResponse<UserSearchResult>>(
      `${environment.apiUrl}/users/search`,
      { params: { q: query } }
    );
  }

  getGameProfiles(username: string): Observable<GameProfile[]> {
    return this.http.get<GameProfile[]>(`${environment.apiUrl}/users/${username}/game-profiles`);
  }

}

