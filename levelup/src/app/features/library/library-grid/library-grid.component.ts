import { Component, Input } from '@angular/core';
import { LibraryEntry } from '../../../core/models/library-entry.model';
import { GameCardComponent } from '../../../shared/components/game-card/game-card.component';
import { GameCardInput } from '../../../core/models/game-card.model';
import { PLATFORM_LABELS } from '../../../core/utils/platform-labels';

@Component({
  selector: 'app-library-grid',
  imports: [GameCardComponent],
  templateUrl: './library-grid.component.html',
  styleUrl: './library-grid.component.scss'
})
export class LibraryGridComponent {
  @Input() entries: LibraryEntry[] = [];

  get shelves(): LibraryEntry[][] {
    const result: LibraryEntry[][] = [];
    for (let i = 0; i < this.entries.length; i += 5) {
      result.push(this.entries.slice(i, i + 5));
    }
    return result;
  }

  toCard(entry: LibraryEntry): GameCardInput {
    return { kind: 'entry', data: entry };
  }

  platformLabel(platform: string): string {
    return PLATFORM_LABELS[platform] ?? platform;
  }
}
