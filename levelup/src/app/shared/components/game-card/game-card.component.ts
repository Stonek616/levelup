import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCardInput, isLibraryEntry } from '../../../core/models/game-card.model';
import { GameSummary } from '../../../core/models/game.model';
import { LibraryEntry } from '../../../core/models/library-entry.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { OwnedToggleComponent } from '../owned-toggle/owned-toggle.component';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink, StatusBadgeComponent, OwnedToggleComponent],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {
  @Input({ required: true }) card!: GameCardInput;

  get game(): GameSummary {
    return isLibraryEntry(this.card) ? this.card.data.game : this.card.data;
  }

  get libraryEntry(): LibraryEntry | null {
    return isLibraryEntry(this.card) ? this.card.data : null;
  }

  get coverUrl(): string | null {
    if (!this.game.coverImageId) return null;
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${this.game.coverImageId}.jpg`;
  }
}
