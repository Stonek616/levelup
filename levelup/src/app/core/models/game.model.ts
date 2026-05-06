
export interface GameSummary {
    id: string;
    igdbId: number;
    title: string;
    coverImageId: string | null;
    releaseYear: number | null;
    platforms: string[];
}

export interface GameDetail extends GameSummary {
    summary: string | null;
    storyline: string | null;
    playerPerspectives: string[];
    gameModes: string[];
    developers: string[];
    genres: string[];
    themes: string[];
}