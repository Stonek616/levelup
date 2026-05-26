export type WhatToPlayPlatform = string;
export type TimeAvailable = 'SHORT' | 'FEW_HOURS' | 'ALL_DAY';
export type Mood = 'FAMILIAR' | 'NEW' | 'SURPRISE';
export type SuggestionSource =
  | 'BACKLOG'
  | 'OWNED'
  | 'ALREADY_PLAYED'
  | 'NEW_SUGGESTION';

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
  slug: string;
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
