import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LibraryEntry, CreateLibraryEntryRequest, UpdateLibraryEntryRequest } from '../models/library-entry.model';
import { PagedResponse } from '../models/api-response.model';
import { LibraryStatus } from '../models/enums';

@Injectable({ providedIn: "root" })
export class LibraryService {

    private readonly http = inject(HttpClient);

    getLibrary(filters?: {
        status?: LibraryStatus;
        owned?: boolean;
        platform?: string;
        page?: number;
        size?: number;
    }): Observable<PagedResponse<LibraryEntry>> {
        let params = new HttpParams();
        if (filters?.status != null) params = params.set('status', filters.status);
        if (filters?.owned != null) params = params.set('owned', filters.owned);
        if (filters?.platform != null) params = params.set('platform', filters.platform);
        if (filters?.page != null) params = params.set('page', filters.page);
        if (filters?.size != null) params = params.set('size', filters.size);
        return this.http.get<PagedResponse<LibraryEntry>>(`${environment.apiUrl}/library`, { params });
    }

    addToLibrary(request: CreateLibraryEntryRequest): Observable<LibraryEntry> {
        return this.http.post<LibraryEntry>(`${environment.apiUrl}/library`, request);
    }

    updateEntry(entryId: string, request: UpdateLibraryEntryRequest): Observable<LibraryEntry> {
        return this.http.patch<LibraryEntry>(`${environment.apiUrl}/library/${entryId}`, request);
    }

    deleteEntry(entryId: string): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/library/${entryId}`);
    }
    getEntryForGame(gameId: string): Observable<LibraryEntry> {
  return this.http.get<LibraryEntry>(`${environment.apiUrl}/library/game/${gameId}`);
}
}