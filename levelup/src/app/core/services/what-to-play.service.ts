import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  WhatToPlayRequest,
  WhatToPlayResponse,
} from '../models/what-to-play.model';

@Injectable({ providedIn: 'root' })
export class WhatToPlayService {
  private readonly http = inject(HttpClient);

  getSuggestions(request: WhatToPlayRequest): Observable<WhatToPlayResponse> {
    return this.http.post<WhatToPlayResponse>(
      `${environment.apiUrl}/what-to-play`,
      request,
    );
  }
}
