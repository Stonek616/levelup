export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  gameCount: number;
  previewCoverIds: string[];
  createdAt: string;
}

export interface CollectionGame {
  id: string;
  slug: string;
  title: string;
  coverImageId: string | null;
  addedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  ownerId: string;
  ownerUsername: string;
  games: CollectionGame[];
  createdAt: string;
  updatedAt: string;
}
