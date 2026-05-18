import { Component, inject, signal, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../../core/services/game.service';
import { AuthService } from '../../../core/services/auth.service';
import { GameDetail } from '../../../core/models/game.model';
import { UserGameActionsComponent } from './user-game-actions/user-game-actions.component';
import { GameReviewsComponent } from './game-reviews/game-reviews.component';

@Component({
  selector: 'app-game-detail-page',
  imports: [UserGameActionsComponent, GameReviewsComponent],
  templateUrl: './game-detail-page.component.html',
  styleUrl: './game-detail-page.component.scss'
})
export class GameDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);
  private readonly location = inject(Location);
  readonly authService = inject(AuthService);

  game = signal<GameDetail | null>(null);
  loading = signal(true);

  get coverUrl(): string | null {
    const id = this.game()?.coverImageId;
    if (!id) return null;
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${id}.jpg`;
  }

  goBack() { this.location.back(); }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.gameService.getGame(id).subscribe({
      next: (g) => { this.game.set(g); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
