export enum LibraryStatus {
  Backlog = 'BACKLOG',
  Playing = 'PLAYING',
  Played = 'PLAYED',
  Finished = 'FINISHED',
  Completed = 'COMPLETED',
  Abandoned = 'ABANDONED',
}

export type OwnershipStatus = 'NONE' | 'WISHLIST' | 'OWNED';

export enum FriendshipStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
}

export enum FeedEventType {
  StatusChange = 'STATUS_CHANGE',
  RatingAdded = 'RATING_ADDED',
  ReviewPosted = 'REVIEW_POSTED',
  CollectionCreated = 'COLLECTION_CREATED',
  GameAdded = 'GAME_ADDED',
}

export enum VisibilityType {
  Public = 'PUBLIC',
  Friends = 'FRIENDS',
  Private = 'PRIVATE',
}

export enum TimeAvailable {
  Short = 'SHORT',
  FewHours = 'FEW_HOURS',
  AllDay = 'ALL_DAY',
}

export enum Mood {
  Familiar = 'FAMILIAR',
  New = 'NEW',
  Suprise = 'SUPRISE',
}

export enum Platform {
  PC = 'PC',
  PlayStation4 = 'PS4',
  PlayStation5 = 'PS5',
  XboxOne = 'XBOXONE',
  XboxSeriesXS = 'XBOXXS',
  NintendoSwitch = 'SWITCH',
  iOS = 'IOS',
  Android = 'ANDROID',
  Any = 'ANY',
}

export enum SuggestionSource {
  Backlog = 'BACKLOG',
  Owned = 'OWNED',
  AlreadyPlayed = 'ALREADY_PLAYED',
  NewSuggestion = 'NEW_SUGGESTION',
}

export enum GamePlatform {
  PSN = 'PSN',
  Xbox = 'XBOX',
  Steam = 'STEAM',
  Nintendo = 'NINTENDO',
  Epic = 'EPIC',
  BattleNet = 'BATTLENET',
  Discord = 'DISCORD',
}

export const GamePlatformLabels: Record<GamePlatform, string> = {
  [GamePlatform.PSN]: 'PlayStation Network',
  [GamePlatform.Xbox]: 'Xbox',
  [GamePlatform.Steam]: 'Steam',
  [GamePlatform.Nintendo]: 'Nintendo',
  [GamePlatform.Epic]: 'Epic Games',
  [GamePlatform.BattleNet]: 'Battle.net',
  [GamePlatform.Discord]: 'Discord',
};

export const LibraryStatusLabels: Record<LibraryStatus, string> = {
  [LibraryStatus.Backlog]: 'Backlog',
  [LibraryStatus.Playing]: 'Playing',
  [LibraryStatus.Played]: 'Played',
  [LibraryStatus.Finished]: 'Finished',
  [LibraryStatus.Completed]: 'Completed',
  [LibraryStatus.Abandoned]: 'Abandoned',
};
