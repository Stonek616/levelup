import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { LibraryService } from '../../../../core/services/library.service';
import { LibraryEntry } from '../../../../core/models/library-entry.model';
import { LibraryStatus } from '../../../../core/models/enums';
import { StatusPickerComponent } from '../../../../shared/components/status-picker/status-picker.component';
import { OwnedToggleComponent } from '../../../../shared/components/owned-toggle/owned-toggle.component';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';

@Component({
  selector: 'app-user-game-actions',
  imports: [StatusPickerComponent, OwnedToggleComponent, RatingStarsComponent],
  templateUrl: './user-game-actions.component.html',
  styleUrl: './user-game-actions.component.scss'
})
export class UserGameActionsComponent implements OnInit {
  @Input({ required: true }) gameId!: string;
  @Input() gamePlatforms: string[] = [];

  private readonly libraryService = inject(LibraryService);

  entry = signal<LibraryEntry | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.libraryService.getEntryForGame(this.gameId).subscribe({
      next: (e) => { this.entry.set(e); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onStatusSelected(status: LibraryStatus): void {
    const current = this.entry();
    if (!current) {
      this.libraryService.addToLibrary({ gameId: this.gameId, status, isOwned: false })
        .subscribe(e => this.entry.set(e));
    } else {
      this.libraryService.updateEntry(current.id, { status })
        .subscribe(e => this.entry.set(e));
    }
  }

  onOwnedChanged(change: { isOwned: boolean; platforms: string[] }): void {
    const current = this.entry();
    if (!current) return;
    this.libraryService.updateEntry(current.id, { isOwned: change.isOwned, platforms: change.platforms })
      .subscribe(e => this.entry.set(e));
  }

  onRatingChanged(rating: number): void {
    const current = this.entry();
    if (!current) return;
    this.libraryService.updateEntry(current.id, { rating })
      .subscribe(e => this.entry.set(e));
  }

  removeFromLibrary(): void {
    const current = this.entry();
    if (!current) return;
    this.libraryService.deleteEntry(current.id)
      .subscribe(() => this.entry.set(null));
  }
}
