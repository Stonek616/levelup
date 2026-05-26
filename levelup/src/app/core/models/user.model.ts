import { VisibilityType } from './enums';

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
  email?: string;
  bio: string | null;
  avatarUrl: string | null;
  onboardingCompleted?: boolean;
  createdAt: string;
  libraryCount: number;
  completedCount: number;
  reviewCount: number;
  friendCount: number | null;
  isFriend: boolean | null;
  friendRequestStatus: string | null;
  libraryVisibility?: VisibilityType;
  wishlistVisibility?: VisibilityType;
  reviewsVisibility?: VisibilityType;
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
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  role: 'USER' | 'ADMIN';
}
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
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

export interface FriendshipEntry {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  friendSince: string;
}

export interface FriendRequest {
  id: string;
  requester: UserSummary;
  createdAt: string;
}

export interface FriendRequestAction {
  id: string;
  status: string;
  updatedAt: string;
}

export interface OnboardingRequest {
  favouriteGenres: string[];
  platforms: string[];
  seededGameIds?: string[];
}

export interface UpdateAccountSettingsRequest {
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface PrivacySettingsRequest {
  libraryVisibility?: VisibilityType;
  wishlistVisibility?: VisibilityType;
  reviewsVisibility?: VisibilityType;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface GameProfile {
  id: string;
  platform: string;
  handle: string;
}

export interface CreateGameProfileRequest {
  platform: string;
  handle: string;
}

export interface MessageResponse {
  message: string;
}
