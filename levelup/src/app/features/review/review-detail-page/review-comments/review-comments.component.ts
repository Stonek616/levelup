import { Component, Input, OnInit, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CommentService } from '../../../../core/services/comment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { Comment } from '../../../../core/models/review.model';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ReportModalComponent } from '../../../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-review-comments',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    AvatarComponent,
    ConfirmDialogComponent,
    ReportModalComponent,
  ],
  templateUrl: './review-comments.component.html',
  styleUrl: './review-comments.component.scss',
})
export class ReviewCommentsComponent implements OnInit {
  @Input({ required: true }) reviewId!: string;

  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  comments = signal<Comment[]>([]);
  loading = signal(true);
  submitting = signal(false);
  reportingCommentId = signal<string | null>(null);
  deletingCommentId = signal<string | null>(null);

  commentForm = new FormGroup({
    body: new FormControl('', [Validators.required]),
  });

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  currentUserId(): string | undefined {
    return this.userService.currentUser()?.id;
  }

  ngOnInit(): void {
    this.commentService.getComments(this.reviewId).subscribe({
      next: (page) => {
        this.comments.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    if (this.commentForm.invalid || this.submitting()) return;

    const body = this.commentForm.value.body!;
    this.submitting.set(true);

    this.commentService.addComment(this.reviewId, { body }).subscribe({
      next: (comment) => {
        this.comments.update((list) => [...list, comment]);
        this.commentForm.reset();
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }

  toggleLike(comment: Comment): void {
    if (!this.isLoggedIn) return;

    const wasLiked = comment.likedByMe;
    const prevCount = comment.likeCount;

    this.comments.update((list) =>
      list.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              likedByMe: !wasLiked,
              likeCount: wasLiked ? prevCount - 1 : prevCount + 1,
            }
          : c,
      ),
    );

    const action$ = wasLiked
      ? this.commentService.unlikeComment(comment.id)
      : this.commentService.likeComment(comment.id);

    action$.subscribe({
      next: (res) => {
        this.comments.update((list) =>
          list.map((c) =>
            c.id === comment.id
              ? { ...c, likedByMe: res.likedByMe, likeCount: res.likeCount }
              : c,
          ),
        );
      },
      error: () => {
        this.comments.update((list) =>
          list.map((c) =>
            c.id === comment.id
              ? { ...c, likedByMe: wasLiked, likeCount: prevCount }
              : c,
          ),
        );
      },
    });
  }

  deleteComment(commentId: string): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () =>
        this.comments.update((list) => list.filter((c) => c.id !== commentId)),
    });
  }
}
