import { LibraryStatus } from "./enums";
import { GameSummary } from "./game.model";

export interface LibraryEntry {
    id: string;
    game: GameSummary;
    status: LibraryStatus;
    isOwned: boolean;
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
    status: LibraryStatus;
    isOwned: boolean;
}

export interface CreateLibraryEntryRequest {
    gameId: string;
    status: LibraryStatus;
    isOwned: boolean;
    platforms?: string[];
}

export interface UpdateLibraryEntryRequest {
    status?: LibraryStatus;
    isOwned?: boolean;
    platforms?: string[];
    rating?: number;
}