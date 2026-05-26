import { LibraryStatus, OwnershipStatus } from './enums';
import { GameSummary } from './game.model';

export interface LibraryEntry {
  id: string;
  game: GameSummary;
  status: LibraryStatus | null;
  ownership: OwnershipStatus;
  platforms: string[];
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SharedGame {
  id: string;
  title: string;
  coverUrl: string | null;
  genres: string[];
  gameModes: string[];
  currentUserEntry: SharedGameEntry;
  friendEntry: SharedGameEntry;
}

export interface SharedGameEntry {
  status: LibraryStatus | null;
  ownership: OwnershipStatus;
}

export interface CreateLibraryEntryRequest {
  gameId: string;
  status?: LibraryStatus;
  ownership: OwnershipStatus;
  platforms?: string[];
}

export interface UpdateLibraryEntryRequest {
  status?: LibraryStatus;
  ownership?: OwnershipStatus;
  platforms?: string[];
  rating?: number;
}
