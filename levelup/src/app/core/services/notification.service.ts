import { Injectable, OnDestroy, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { FriendService } from './friend.service';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly friendService = inject(FriendService);

  pendingFriendRequests = signal(0);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(
      () => {
        if (this.authService.isAuthenticated()) {
          this.startPolling();
        } else {
          this.stopPolling();
        }
      },
      { allowSignalWrites: true },
    );
  }

  private startPolling() {
    this.fetchPending();
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.fetchPending(), 60_000);
    }
  }

  private stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.pendingFriendRequests.set(0);
  }

  private fetchPending() {
    this.friendService.getPendingRequests(0, 1).subscribe({
      next: (page) => this.pendingFriendRequests.set(page.totalElements),
      error: () => {},
    });
  }

  ngOnDestroy() {
    this.stopPolling();
  }
}
