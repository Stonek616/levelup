import { LibraryStatus } from './enums';
export interface Game {
  id: string;
  igdbId: number;
  slug: string;
  title: string;
  coverImageId: string | null;
  firstReleaseDate: string | null;
  releaseYear: number | null;
  summary: string | null;
  storyline: string | null;
  genres: string[];
  platforms: string[];
  gameModes: string[];
  playerPerspectives: string[];
  developers: string[];
  themes: string[];
  userEntry: GameUserEntry | null;
  friendEntries: FriendGameEntry[];
}

export interface GameSummary {
  id: string;
  igdbId: number;
  slug: string;
  title: string;
  coverImageId: string | null;
  releaseYear: number | null;
  platforms: string[];
}

export interface GameDetail extends GameSummary {
  firstReleaseDate: string | null;
  summary: string | null;
  storyline: string | null;
  playerPerspectives: string[];
  gameModes: string[];
  developers: string[];
  genres: string[];
  themes: string[];
}
export interface GameUserEntry {
  status: LibraryStatus;
  isOwned: boolean;
  platforms: string[];
  rating: number | null;
}

export interface FriendGameEntry {
  username: string;
  avatarUrl: string | null;
  status: string;
  rating: number | null;
}
