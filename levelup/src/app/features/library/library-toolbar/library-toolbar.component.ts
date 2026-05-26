import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
} from '@angular/core';
import { NgClass } from '@angular/common';
import {
  LibraryStatus,
  LibraryStatusLabels,
  OwnershipStatus,
} from '../../../core/models/enums';
import { PLATFORM_LABELS } from '../../../core/utils/platform-labels';

export interface LibraryFilters {
  status: LibraryStatus | null;
  platform: string | null;
  ownership: OwnershipStatus | null;
}

@Component({
  selector: 'app-library-toolbar',
  imports: [NgClass],
  templateUrl: './library-toolbar.component.html',
  styleUrl: './library-toolbar.component.scss',
})
export class LibraryToolbarComponent {
  @Input() availablePlatforms: string[] = [];
  @Output() filtersChanged = new EventEmitter<LibraryFilters>();

  readonly allStatuses = Object.values(LibraryStatus);
  readonly labels = LibraryStatusLabels;

  activeStatus: LibraryStatus | null = null;
  activePlatform: string | null = null;
  ownedOnly = false;

  expanded = signal(false);

  activeChips = computed(() => {
    const chips: string[] = [];
    if (this.activeStatus) chips.push(this.labels[this.activeStatus]);
    if (this.activePlatform)
      chips.push(this.platformLabel(this.activePlatform));
    if (this.ownedOnly) chips.push('Owned only');
    return chips;
  });

  platformLabel(platform: string): string {
    return PLATFORM_LABELS[platform] ?? platform;
  }

  selectStatus(status: LibraryStatus | null): void {
    this.activeStatus = status;
    this.emit();
  }

  selectPlatform(platform: string | null): void {
    this.activePlatform = platform;
    this.emit();
  }

  toggleOwned(): void {
    this.ownedOnly = !this.ownedOnly;
    this.emit();
  }

  private emit(): void {
    this.filtersChanged.emit({
      status: this.activeStatus,
      platform: this.activePlatform,
      ownership: this.ownedOnly ? 'OWNED' : null,
    });
  }
}
