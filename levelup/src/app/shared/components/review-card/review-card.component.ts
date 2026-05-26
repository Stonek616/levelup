import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Review } from '../../../core/models/review.model';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-review-card',
  imports: [RouterLink, DatePipe, AvatarComponent],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.scss',
})
export class ReviewCardComponent implements OnInit {
  @Input({ required: true }) review!: Review;

  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);

  likeCount = signal(0);
  likedByMe = signal(false);

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated() !== null;
  }

  ngOnInit(): void {
    this.likeCount.set(this.review.likeCount);
    this.likedByMe.set(this.review.likedByMe);
  }

  toggleLike(): void {
    if (!this.isLoggedIn) return;

    const wasLiked = this.likedByMe();
    const prevCount = this.likeCount();

    this.likedByMe.set(!wasLiked);
    this.likeCount.set(wasLiked ? prevCount - 1 : prevCount + 1);

    const action$ = wasLiked
      ? this.reviewService.unlikeReview(this.review.id)
      : this.reviewService.likeReview(this.review.id);

    action$.subscribe({
      next: (res) => {
        this.likeCount.set(res.likeCount);
        this.likedByMe.set(res.likedByMe);
      },
      error: () => {
        this.likedByMe.set(wasLiked);
        this.likeCount.set(prevCount);
      },
    });
  }
}
