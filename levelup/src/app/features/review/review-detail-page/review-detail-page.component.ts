import { Component, OnInit, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/models/review.model';
import { ReviewBodyComponent } from './review-body/review-body.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';

@Component({
  selector: 'app-review-detail-page',
  imports: [ReviewBodyComponent, ReviewCommentsComponent],
  templateUrl: './review-detail-page.component.html',
  styleUrl: './review-detail-page.component.scss',
})
export class ReviewDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reviewService = inject(ReviewService);
  private readonly location = inject(Location);

  review = signal<Review | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.reviewService.getReview(id).subscribe({
      next: (r) => {
        this.review.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Review not found.');
        this.loading.set(false);
      },
    });
  }
}
