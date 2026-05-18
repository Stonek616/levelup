import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService } from '../../../../core/services/review.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { Review } from '../../../../core/models/review.model';
import { ReviewCardComponent } from '../../../../shared/components/review-card/review-card.component';


@Component({
  selector: 'app-game-reviews',
  imports: [ReactiveFormsModule, ReviewCardComponent],
  templateUrl: './game-reviews.component.html',
  styleUrl: './game-reviews.component.scss'
})
export class GameReviewsComponent implements OnInit {
  @Input({ required: true }) gameId!: string;

  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  reviews = signal<Review[]>([]);
  loading = signal(true);
  submitting = signal(false);
  submitError = signal<string | null>(null);

  reviewForm = new FormGroup({
    body: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get userHasReviewed(): boolean {
    const userId = this.userService.currentUser()?.id;
    if (!userId) return false;
    return this.reviews().some(r => r.author.id === userId);
  }

  ngOnInit(): void {
    this.reviewService.getReviewsForGame(this.gameId).subscribe({
      next: (page) => {
        this.reviews.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    if (this.reviewForm.invalid || this.submitting()) return;

    const body = this.reviewForm.value.body!;
    this.submitting.set(true);
    this.submitError.set(null);

    this.reviewService.createReview(this.gameId, { body }).subscribe({
      next: (review) => {
        this.reviews.update(current => [review, ...current]);
        this.reviewForm.reset();
        this.submitting.set(false);
      },
      error: (err) => {
        const msg = err.status === 409
          ? 'You have already reviewed this game.'
          : err.status === 403
          ? 'Add this game to your library before writing a review.'
          : 'Something went wrong. Please try again.';
        this.submitError.set(msg);
        this.submitting.set(false);
      }
    });
  }
}
