import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse } from '../models/api-response.model';
import { Comment, LikeResponse, CreateCommentRequest } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);

  getComments(reviewId: string, page = 0, size = 20): Observable<PagedResponse<Comment>> {
    return this.http.get<PagedResponse<Comment>>(
      `${environment.apiUrl}/reviews/${reviewId}/comments?page=${page}&size=${size}&sort=createdAt,asc`
    );
  }

  addComment(reviewId: string, request: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${environment.apiUrl}/reviews/${reviewId}/comments`, request);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/comments/${commentId}`);
  }

  likeComment(commentId: string): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${environment.apiUrl}/comments/${commentId}/like`, {});
  }

  unlikeComment(commentId: string): Observable<LikeResponse> {
    return this.http.delete<LikeResponse>(`${environment.apiUrl}/comments/${commentId}/like`);
  }
}
