import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChallengeHistory,
  ChallengeResponse,
  ChallengeResult,
  SubmitChallengeRequest,
} from '../models/challenge.model';

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/challenge`;

  getToday(): Observable<ChallengeResponse> {
    return this.http.get<ChallengeResponse>(`${this.base}/today`);
  }

  submit(request: SubmitChallengeRequest): Observable<ChallengeResult> {
    return this.http.post<ChallengeResult>(
      `${this.base}/today/submit`,
      request,
    );
  }

  getHistory(page = 0, size = 30): Observable<ChallengeHistory> {
    return this.http.get<ChallengeHistory>(`${this.base}/history`, {
      params: { page: page.toString(), size: size.toString() },
    });
  }
}
