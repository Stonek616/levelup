import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse } from '../models/api-response.model';
import {
  FriendshipEntry,
  FriendRequest,
  FriendRequestAction,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private readonly http = inject(HttpClient);

  getFriends(page = 0, size = 20): Observable<PagedResponse<FriendshipEntry>> {
    return this.http.get<PagedResponse<FriendshipEntry>>(
      `${environment.apiUrl}/friends`,
      { params: { page, size } },
    );
  }

  getPendingRequests(
    page = 0,
    size = 20,
  ): Observable<PagedResponse<FriendRequest>> {
    return this.http.get<PagedResponse<FriendRequest>>(
      `${environment.apiUrl}/friends/requests`,
      { params: { page, size } },
    );
  }

  sendFriendRequest(targetUserId: string): Observable<FriendRequestAction> {
    return this.http.post<FriendRequestAction>(
      `${environment.apiUrl}/friends/requests`,
      { targetUserId },
    );
  }

  respondToRequest(
    requestId: string,
    action: 'ACCEPT' | 'DECLINE',
  ): Observable<FriendRequestAction> {
    return this.http.patch<FriendRequestAction>(
      `${environment.apiUrl}/friends/requests/${requestId}`,
      { action },
    );
  }

  removeFriend(userId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/friends/${userId}`);
  }
}
