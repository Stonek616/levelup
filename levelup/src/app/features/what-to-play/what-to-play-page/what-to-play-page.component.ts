import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WhatToPlayService } from '../../../core/services/what-to-play.service';
import {
  GameSuggestion,
  Mood,
  SuggestionSource,
  TimeAvailable,
  WhatToPlayPlatform,
} from '../../../core/models/what-to-play.model';

type Step = 'platform' | 'mood' | 'time' | 'options' | 'results';

@Component({
  selector: 'app-what-to-play-page',
  imports: [RouterLink],
  templateUrl: './what-to-play-page.component.html',
  styleUrl: './what-to-play-page.component.scss',
})
export class WhatToPlayPageComponent {
  private readonly whatToPlayService = inject(WhatToPlayService);

  step = signal<Step>('platform');
  loading = signal(false);

  platform = signal<WhatToPlayPlatform>('ANY');
  mood = signal<Mood>('ANYTHING');
  timeAvailable = signal<TimeAvailable>('FEW_HOURS');
  includeAlreadyPlayed = signal(false);
  includeNewSuggestions = signal(true);

  suggestions = signal<GameSuggestion[]>([]);
  error = signal(false);

  readonly platformOptions: { value: WhatToPlayPlatform; label: string; emoji: string }[] = [
    { value: 'PC', label: 'PC', emoji: '🖥️' },
    { value: 'PLAYSTATION', label: 'PlayStation', emoji: '🎮' },
    { value: 'XBOX', label: 'Xbox', emoji: '🟢' },
    { value: 'SWITCH', label: 'Switch', emoji: '🕹️' },
    { value: 'ANY', label: 'Any platform', emoji: '🌐' },
  ];

  readonly moodOptions: { value: Mood; label: string; description: string; emoji: string }[] = [
    { value: 'CHILL', label: 'Chill & Relaxed', description: 'Puzzles, sims, cozy games', emoji: '😌' },
    { value: 'STORY', label: 'Epic Story', description: 'Adventures and narratives', emoji: '📖' },
    { value: 'CHALLENGE', label: 'Challenge Me', description: 'Platformers, action, shooters', emoji: '⚔️' },
    { value: 'SOCIAL', label: 'Play with Friends', description: 'Multiplayer and co-op', emoji: '👥' },
    { value: 'ANYTHING', label: 'Surprise Me', description: 'Whatever fits', emoji: '🎲' },
  ];

  readonly timeOptions: { value: TimeAvailable; label: string; description: string; emoji: string }[] = [
    { value: 'SHORT', label: 'Quick Session', description: 'Under an hour', emoji: '⚡' },
    { value: 'FEW_HOURS', label: 'A Few Hours', description: '1–4 hours', emoji: '🕐' },
    { value: 'ALL_DAY', label: 'All Day', description: '4+ hours', emoji: '🌅' },
  ];

  selectPlatform(p: WhatToPlayPlatform): void {
    this.platform.set(p);
    this.step.set('mood');
  }

  selectMood(m: Mood): void {
    this.mood.set(m);
    this.step.set('time');
  }

  selectTime(t: TimeAvailable): void {
    this.timeAvailable.set(t);
    this.step.set('options');
  }

  findGame(): void {
    this.loading.set(true);
    this.error.set(false);

    this.whatToPlayService.getSuggestions({
      platform: this.platform(),
      mood: this.mood(),
      timeAvailable: this.timeAvailable(),
      multiplayer: this.mood() === 'SOCIAL',
      includeAlreadyPlayed: this.includeAlreadyPlayed(),
      includeNewSuggestions: this.includeNewSuggestions(),
    }).subscribe({
      next: (res) => {
        this.suggestions.set(res.suggestions);
        this.step.set('results');
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  restart(): void {
    this.step.set('platform');
    this.platform.set('ANY');
    this.mood.set('ANYTHING');
    this.timeAvailable.set('FEW_HOURS');
    this.includeAlreadyPlayed.set(false);
    this.includeNewSuggestions.set(true);
    this.suggestions.set([]);
    this.error.set(false);
  }

  platformLabel(): string {
    return this.platformOptions.find(o => o.value === this.platform())?.label ?? '';
  }

  moodLabel(): string {
    return this.moodOptions.find(o => o.value === this.mood())?.label ?? '';
  }

  timeLabel(): string {
    return this.timeOptions.find(o => o.value === this.timeAvailable())?.label ?? '';
  }

  sourceLabel(source: SuggestionSource): string {
    return ({
      BACKLOG: 'Backlog',
      OWNED: 'Owned',
      ALREADY_PLAYED: 'Played',
      NEW_SUGGESTION: 'New Pick',
    } as Record<SuggestionSource, string>)[source];
  }

  sourceBadgeClass(source: SuggestionSource): string {
    return ({
      BACKLOG: 'badge--backlog',
      OWNED: 'badge--owned',
      ALREADY_PLAYED: 'badge--played',
      NEW_SUGGESTION: 'badge--new',
    } as Record<SuggestionSource, string>)[source];
  }
}
