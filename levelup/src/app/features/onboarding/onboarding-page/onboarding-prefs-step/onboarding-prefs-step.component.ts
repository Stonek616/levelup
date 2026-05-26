import { Component, EventEmitter, Output, signal } from '@angular/core';

const GENRES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation',
  'Sports', 'Racing', 'Fighting', 'Shooter', 'Puzzle',
  'Horror', 'Platform', 'Indie', 'MMORPG', 'Stealth',
];

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile'];

@Component({
  selector: 'app-onboarding-prefs-step',
  templateUrl: './onboarding-prefs-step.component.html',
  styleUrl: './onboarding-prefs-step.component.scss',
})
export class OnboardingPrefsStepComponent {
  @Output() completed = new EventEmitter<{ genres: string[]; platforms: string[] }>();

  readonly genres = GENRES;
  readonly platforms = PLATFORMS;

  selectedGenres = signal<Set<string>>(new Set());
  selectedPlatforms = signal<Set<string>>(new Set());

  toggleGenre(genre: string) {
    const next = new Set(this.selectedGenres());
    next.has(genre) ? next.delete(genre) : next.add(genre);
    this.selectedGenres.set(next);
  }

  togglePlatform(platform: string) {
    const next = new Set(this.selectedPlatforms());
    next.has(platform) ? next.delete(platform) : next.add(platform);
    this.selectedPlatforms.set(next);
  }

  isGenreSelected(genre: string) {
    return this.selectedGenres().has(genre);
  }

  isPlatformSelected(platform: string) {
    return this.selectedPlatforms().has(platform);
  }

  canContinue() {
    return this.selectedGenres().size > 0 && this.selectedPlatforms().size > 0;
  }

  continue() {
    if (!this.canContinue()) return;
    this.completed.emit({
      genres: [...this.selectedGenres()],
      platforms: [...this.selectedPlatforms()],
    });
  }
}
