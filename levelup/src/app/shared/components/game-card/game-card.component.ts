import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSummary } from '../../../core/models/game.model';

@Component({
  selector: 'app-game-card',
  imports: [CommonModule],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {

  @Input() game!: GameSummary;

  get coverUrl(): string | null {
    if (!this.game.coverImageId) return null;
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${this.game.coverImageId}.jpg`;
  }
}
