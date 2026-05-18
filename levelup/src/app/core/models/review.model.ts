export interface ReviewAuthor {
    id: string;
    username: string;
    avatarUrl: string | null;
}

export interface ReviewGame {
    id: string;
    title: string;
}

export interface Review {
    id: string;
    author: ReviewAuthor;
    game: ReviewGame;
    body: string;
    rating: number | null;
    likeCount: number;
    commentCount: number;
    likedByMe: boolean;
    isFriendReview: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    author: ReviewAuthor;
    body: string;
    likeCount: number;
    likedByMe: boolean;
    createdAt: string;
}

export interface LikeResponse {
    likeCount: number;
    likedByMe: boolean;
}

export interface CreateReviewRequest {
    body: string;
}

export interface CreateCommentRequest {
    body: string;
}