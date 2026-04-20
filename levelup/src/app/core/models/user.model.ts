import { VisibilityType } from "./enums";

export interface User {
    id: string;
    username: string;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
    onboardingCompleted: boolean;
}

export interface UserProfile {
    id: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
  /**   createdAt: string;
    libraryCount: number;
    completedCount: number;
    reviewCount: number;
    isFriend: boolean;
    friendRequestStatus: string | null;
    */
}

export interface UserSummary {
    id: string;
    username: string;
    avatarUrl: string | null;
    isFriend?: boolean;
    friendRequestStatus?: string | null;
}

export interface UserSearchResult extends UserSummary {
    isFriend: boolean;
    friendRequestStatus: string | null;
}

export interface TasteProfile {
    username: string;
    genres: GenreBreakdown[];
    topTags: string[];
    topPlatforms: string[];
    averageRating: number;
    totalRated: number;
    compatibility: number | null;
}

export interface GenreBreakdown {
    name: string;
    count: number;
    percentage: number;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface UpdateProfileRequest {
    bio?: string;
    avatarUrl?: string;
}

export interface PrivacySettings {
    libraryVisibility: VisibilityType;
    wishlistVisibility: VisibilityType;
    reviewsVisibility: VisibilityType;
}
