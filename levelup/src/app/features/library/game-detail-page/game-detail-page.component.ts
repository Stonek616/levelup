import { Component, inject, signal } from '@angular/core';
import { Location, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { GameService } from '../../../core/services/game.service';
import { AuthService } from '../../../core/services/auth.service';
import { GameDetail } from '../../../core/models/game.model';
import { UserGameActionsComponent } from './user-game-actions/user-game-actions.component';
import { GameReviewsComponent } from './game-reviews/game-reviews.component';

@Component({
  selector: 'app-game-detail-page',
  imports: [UserGameActionsComponent, GameReviewsComponent, DatePipe],
  templateUrl: './game-detail-page.component.html',
  styleUrl: './game-detail-page.component.scss',
})
export class GameDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);
  private readonly location = inject(Location);
  readonly authService = inject(AuthService);

  game = signal<GameDetail | null>(null);
  loading = signal(true);

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.game.set(null);
          this.loading.set(true);
          return this.gameService.getGame(params.get('slug')!);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (g) => {
          this.game.set(g);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  get coverUrl(): string | null {
    const id = this.game()?.coverImageId;
    if (!id) return null;
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${id}.jpg`;
  }

  goBack() {
    this.location.back();
  }
}
