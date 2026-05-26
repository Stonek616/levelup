import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { PLATFORM_LABELS } from '../../../core/utils/platform-labels';

@Component({
  selector: 'app-owned-toggle',
  imports: [],
  templateUrl: './owned-toggle.component.html',
  styleUrl: './owned-toggle.component.scss',
})
export class OwnedToggleComponent {
  @Input() isOwned = false;
  @Input() ownedPlatforms: string[] = [];
  @Input() availablePlatforms: string[] = [];
  @Output() ownedChange = new EventEmitter<{
    isOwned: boolean;
    platforms: string[];
  }>();

  showPicker = signal(false);
  selected = signal<string[]>([]);

  label(platform: string): string {
    return PLATFORM_LABELS[platform] ?? platform;
  }

  get platformsLabel(): string {
    if (!this.ownedPlatforms.length) return '';
    const names = this.ownedPlatforms.map((p) => this.label(p));
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  }

  open() {
    this.selected.set([...this.ownedPlatforms]);
    this.showPicker.set(true);
  }

  close() {
    this.showPicker.set(false);
  }

  togglePlatform(platform: string) {
    const cur = this.selected();
    this.selected.set(
      cur.includes(platform)
        ? cur.filter((p) => p !== platform)
        : [...cur, platform],
    );
  }

  save() {
    this.ownedChange.emit({ isOwned: true, platforms: this.selected() });
    this.showPicker.set(false);
  }

  unmark() {
    this.ownedChange.emit({ isOwned: false, platforms: [] });
    this.showPicker.set(false);
  }
}
