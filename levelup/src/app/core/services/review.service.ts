import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse } from '../models/api-response.model';
import { Review, LikeResponse, CreateReviewRequest, UpdateReviewRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly http = inject(HttpClient);

  getReviewsForGame(gameId: string, page = 0, size = 10): Observable<PagedResponse<Review>> {
    return this.http.get<PagedResponse<Review>>(
      `${environment.apiUrl}/games/${gameId}/reviews?page=${page}&size=${size}&sort=createdAt,desc`
    );
  }

  getReview(reviewId: string): Observable<Review> {
    return this.http.get<Review>(`${environment.apiUrl}/reviews/${reviewId}`);
  }

  createReview(gameId: string, request: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${environment.apiUrl}/games/${gameId}/reviews`, request);
  }

  getReviewsByUser(username: string, page = 0, size = 10): Observable<PagedResponse<Review>> {
    return this.http.get<PagedResponse<Review>>(
      `${environment.apiUrl}/users/${username}/reviews?page=${page}&size=${size}&sort=createdAt,desc`
    );
  }

  updateReview(reviewId: string, request: UpdateReviewRequest): Observable<Review> {
    return this.http.patch<Review>(`${environment.apiUrl}/reviews/${reviewId}`, request);
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/reviews/${reviewId}`);
  }

  likeReview(reviewId: string): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${environment.apiUrl}/reviews/${reviewId}/like`, {});
  }

  unlikeReview(reviewId: string): Observable<LikeResponse> {
    return this.http.delete<LikeResponse>(`${environment.apiUrl}/reviews/${reviewId}/like`);
  }
}

