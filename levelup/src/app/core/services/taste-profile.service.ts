import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TasteProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TasteProfileService {
  private readonly http = inject(HttpClient);

  getTasteProfile(username: string): Observable<TasteProfile> {
    return this.http.get<TasteProfile>(
      `${environment.apiUrl}/users/${username}/taste-profile`,
    );
  }
}
