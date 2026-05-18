export interface FeedEvent {
  id: string;
  type: 'STATUS_CHANGE' | 'RATING_ADDED' | 'REVIEW_POSTED' | 'COLLECTION_CREATED' | 'GAME_ADDED';
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  game: {
    id: string;
    title: string;
    coverImageId: string | null;
  };
  metadata: string | null;
  createdAt: string;
}

export interface TrendingGame {
  id: string;
  title: string;
  coverImageId: string | null;
  genres: string[];
  communityRating: number | null;
  totalRatings: number;
  recentActivity: number;
}

export interface DiscoveryGame {
  id: string;
  title: string;
  coverImageId: string | null;
  releaseYear: number | null;
  genres: string[];
}
