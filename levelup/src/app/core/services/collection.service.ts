import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Collection, CollectionSummary } from '../models/collection.model';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private http = inject(HttpClient);
  private base = '/api/v1';

  getUserCollections(username: string): Observable<CollectionSummary[]> {
    return this.http.get<CollectionSummary[]>(
      `${this.base}/users/${username}/collections`,
    );
  }

  getCollection(id: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.base}/collections/${id}`);
  }

  createCollection(body: {
    name: string;
    description?: string;
    visibility: string;
  }): Observable<Collection> {
    return this.http.post<Collection>(`${this.base}/collections`, body);
  }

  updateCollection(
    id: string,
    body: { name?: string; description?: string; visibility?: string },
  ): Observable<Collection> {
    return this.http.patch<Collection>(`${this.base}/collections/${id}`, body);
  }

  deleteCollection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/collections/${id}`);
  }

  addGame(collectionId: string, gameId: string): Observable<Collection> {
    return this.http.post<Collection>(
      `${this.base}/collections/${collectionId}/games`,
      { gameId },
    );
  }

  removeGame(collectionId: string, gameId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/collections/${collectionId}/games/${gameId}`,
    );
  }
}
