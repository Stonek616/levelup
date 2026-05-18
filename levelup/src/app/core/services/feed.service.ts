import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse } from '../models/api-response.model';
import { DiscoveryGame, FeedEvent, TrendingGame } from '../models/feed.model';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly http = inject(HttpClient);

  getFriendsFeed(page = 0, size = 20): Observable<PagedResponse<FeedEvent>> {
    return this.http.get<PagedResponse<FeedEvent>>(
      `${environment.apiUrl}/feed`,
      { params: { page, size } }
    );
  }

  getTrending(page = 0, size = 20): Observable<PagedResponse<TrendingGame>> {
    return this.http.get<PagedResponse<TrendingGame>>(
      `${environment.apiUrl}/discover/trending`,
      { params: { page, size } }
    );
  }

  getForYou(page = 0, size = 20): Observable<PagedResponse<DiscoveryGame>> {
    return this.http.get<PagedResponse<DiscoveryGame>>(
      `${environment.apiUrl}/discover/for-you`,
      { params: { page, size } }
    );
  }

  getSimilar(page = 0, size = 20): Observable<PagedResponse<DiscoveryGame>> {
    return this.http.get<PagedResponse<DiscoveryGame>>(
      `${environment.apiUrl}/discover/similar`,
      { params: { page, size } }
    );
  }

  getNewAndNotable(page = 0, size = 20): Observable<PagedResponse<DiscoveryGame>> {
    return this.http.get<PagedResponse<DiscoveryGame>>(
      `${environment.apiUrl}/discover/new`,
      { params: { page, size } }
    );
  }
}
