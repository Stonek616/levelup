import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GameSummary, GameDetail } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {

  private readonly http = inject(HttpClient);

  searchGames(query: string, page = 0, size = 20): Observable<GameSummary[]> {
    return this.http.get<GameSummary[]>(`${environment.apiUrl}/games/search`, {
      params: { q: query, page, size }
    });
  }

  getGame(slug: string): Observable<GameDetail> {
    return this.http.get<GameDetail>(`${environment.apiUrl}/games/slug/${slug}`);
  }
}
