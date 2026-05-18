import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LibraryEntry } from '../../../core/models/library-entry.model';

@Component({
  selector: 'app-library-grid',
  imports: [RouterLink, StatusBadgeComponent],
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

  coverUrl(entry: LibraryEntry): string | null {
    return entry.game.coverImageId
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${entry.game.coverImageId}.jpg`
      : null;
  }
}
