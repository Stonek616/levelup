import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  GameCardInput,
  isLibraryEntry,
} from '../../../core/models/game-card.model';
import { GameSummary } from '../../../core/models/game.model';
import { LibraryEntry } from '../../../core/models/library-entry.model';
import { StatusGlyphComponent } from '../status-glyph/status-glyph.component';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink, StatusGlyphComponent],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
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

  get metaLine(): string {
    const year = this.game.releaseYear ? String(this.game.releaseYear) : null;
    const entry = this.libraryEntry;

    if (!entry) return year ?? '';

    let ownership: string;
    if (entry.ownership === 'WISHLIST') {
      ownership = 'WISHLIST';
    } else if (entry.ownership === 'NONE') {
      ownership = 'UNOWNED';
    } else {
      // OWNED — no ownership label needed in metadata
      ownership = null!;
    }

    const parts = [year, ownership].filter(Boolean);
    return parts.join(' · ');
  }
}
