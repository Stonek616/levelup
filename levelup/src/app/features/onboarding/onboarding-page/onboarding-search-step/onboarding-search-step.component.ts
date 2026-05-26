import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { GameSearchInputComponent } from '../../../../shared/components/game-search-input/game-search-input.component';
import { GameSummary } from '../../../../core/models/game.model';

@Component({
  selector: 'app-onboarding-search-step',
  imports: [GameSearchInputComponent],
  templateUrl: './onboarding-search-step.component.html',
  styleUrl: './onboarding-search-step.component.scss',
})
export class OnboardingSearchStepComponent {
  @Input() submitting = false;
  @Input() error: string | null = null;
  @Output() completed = new EventEmitter<string[]>();
  @Output() back = new EventEmitter<void>();

  seededGames = signal<GameSummary[]>([]);

  onGameSelected(game: GameSummary) {
    if (this.seededGames().some(g => g.id === game.id)) return;
    this.seededGames.update(list => [...list, game]);
  }

  removeGame(id: string) {
    this.seededGames.update(list => list.filter(g => g.id !== id));
  }

  coverUrl(game: GameSummary): string | null {
    if (!game.coverImageId) return null;
    return `https://images.igdb.com/igdb/image/upload/t_thumb/${game.coverImageId}.jpg`;
  }

  finish() {
    this.completed.emit(this.seededGames().map(g => g.id));
  }
}
