import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private readonly _token = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this._token());

  private readonly _initialized = signal(false);
  readonly initialized = this._initialized.asReadonly();


  login(request: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, request,
        { withCredentials: true })  // send/receive HttpOnly cookies
      .pipe(
        tap(response => {
          this._token.set(response.accessToken);
          this.userService.setUser(response.user);
        })
      );
  }

  register(request: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, request,
        { withCredentials: true })
      .pipe(
        tap(response => {
          this._token.set(response.accessToken);
          this.userService.setUser(response.user);
        })
      );
  }


  refreshSession() {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {},
        { withCredentials: true })
      .pipe(
        tap(response => {
          this._token.set(response.accessToken);
          this.userService.setUser(response.user);
          this._initialized.set(true);
        }),
        catchError(() => {
          this._token.set(null);
          this.userService.clearUser();
          this._initialized.set(true);
          return of(null);
        })
      );
  }

  logout() {
    this.http.post(`${environment.apiUrl}/auth/logout`, {},
      { withCredentials: true }).subscribe();
    this._token.set(null);
    this.userService.clearUser();
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this._token();
  }
}