export type WhatToPlayPlatform = 'PC' | 'PLAYSTATION' | 'XBOX' | 'SWITCH' | 'ANY';
export type TimeAvailable = 'SHORT' | 'FEW_HOURS' | 'ALL_DAY';
export type Mood = 'CHILL' | 'STORY' | 'CHALLENGE' | 'SOCIAL' | 'ANYTHING';
export type SuggestionSource = 'BACKLOG' | 'OWNED' | 'ALREADY_PLAYED' | 'NEW_SUGGESTION';

export interface WhatToPlayRequest {
  platform: WhatToPlayPlatform;
  timeAvailable: TimeAvailable;
  mood: Mood;
  multiplayer: boolean;
  includeAlreadyPlayed: boolean;
  includeNewSuggestions: boolean;
}

export interface SuggestionGame {
  id: string;
  title: string;
  coverUrl: string | null;
  genres: string[];
  gameModes: string[];
}

export interface GameSuggestion {
  game: SuggestionGame;
  source: SuggestionSource;
  reason: string;
  rank: number;
}

export interface WhatToPlayResponse {
  suggestions: GameSuggestion[];
}
