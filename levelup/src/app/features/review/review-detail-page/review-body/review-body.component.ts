import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Review } from '../../../../core/models/review.model';
import { ReviewService } from '../../../../core/services/review.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ReportModalComponent } from '../../../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-review-body',
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    AvatarComponent,
    ConfirmDialogComponent,
    ReportModalComponent,
  ],
  templateUrl: './review-body.component.html',
  styleUrl: './review-body.component.scss',
})
export class ReviewBodyComponent implements OnInit {
  @Input({ required: true }) review!: Review;
  @Output() updated = new EventEmitter<Review>();
  @Output() deleted = new EventEmitter<void>();

  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  likeCount = signal(0);
  likedByMe = signal(false);
  showReportModal = signal(false);
  showDeleteConfirm = signal(false);

  editing = signal(false);
  saving = signal(false);
  editBody = '';
  editRating: number | null = null;

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get isOwnReview(): boolean {
    return this.userService.currentUser()?.id === this.review.author.id;
  }

  ngOnInit(): void {
    this.likeCount.set(this.review.likeCount);
    this.likedByMe.set(this.review.likedByMe);
  }

  startEdit(): void {
    this.editBody = this.review.body;
    this.editRating = this.review.rating;
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  saveEdit(): void {
    if (!this.editBody.trim() || this.saving()) return;
    this.saving.set(true);
    this.reviewService
      .updateReview(this.review.id, {
        body: this.editBody.trim(),
        rating: this.editRating,
      })
      .subscribe({
        next: (updated) => {
          this.editing.set(false);
          this.saving.set(false);
          this.updated.emit(updated);
        },
        error: () => this.saving.set(false),
      });
  }

  confirmDelete(): void {
    this.reviewService.deleteReview(this.review.id).subscribe({
      next: () => this.deleted.emit(),
    });
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
