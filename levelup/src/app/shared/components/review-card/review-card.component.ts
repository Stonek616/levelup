import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Comment, Review } from '../../../core/models/review.model';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommentService } from '../../../core/services/comment.service';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-review-card',
  imports: [RouterLink, DatePipe, AvatarComponent, ReactiveFormsModule],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.scss',
})
export class ReviewCardComponent implements OnInit {
  @Input({ required: true }) review!: Review;

  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private readonly commentService = inject(CommentService);

  likeCount = signal(0);
  likedByMe = signal(false);

  showComments = signal(false);
  commentsLoaded = signal(false);
  commentsLoading = signal(false);
  comments = signal<Comment[]>([]);
  commentCount = signal(0);
  submitting = signal(false);

  commentForm = new FormGroup({
    body: new FormControl('', [Validators.required]),
  });

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    this.likeCount.set(this.review.likeCount);
    this.likedByMe.set(this.review.likedByMe);
    this.commentCount.set(this.review.commentCount);
  }

  toggleComments(): void {
    this.showComments.update((v) => !v);
    if (!this.commentsLoaded()) {
      this.commentsLoading.set(true);
      this.commentService.getComments(this.review.id).subscribe({
        next: (page) => {
          this.comments.set(page.content);
          this.commentsLoaded.set(true);
          this.commentsLoading.set(false);
        },
        error: () => this.commentsLoading.set(false),
      });
    }
  }

  submitComment(): void {
    if (this.commentForm.invalid || this.submitting()) return;

    const body = this.commentForm.value.body!;
    this.submitting.set(true);

    this.commentService.addComment(this.review.id, { body }).subscribe({
      next: (comment) => {
        this.comments.update((list) => [...list, comment]);
        this.commentCount.update((n) => n + 1);
        this.commentForm.reset();
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
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
