export class Enums {
}

export enum LibraryStatus {
    Wishlist = 'WISHLIST',
    Backlog = 'BACKLOG',
    Playing = 'PLAYING',
    Played = 'PLAYED',
    Finished = 'FINISHED',
    Completed = 'COMPLETED',
    Abandoned = 'ABANDONED',
}

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
    Chill = 'CHILL',
    Story = 'STORY',
    Challenge = 'CHALLENGE',
    Social = 'SOCIAL',
    Anything = 'ANYTHING',
}

export enum Platform {
    PC = 'PC',
    PlayStation4 = 'PlayStation 4',
    PlayStation5 = 'PlayStation 5',
    XboxOne = 'Xbox One',
    XboxSeriesXS = 'Xbox Series X|S',
    NintendoSwitch = 'Nintendo Switch',
    iOS = 'iOS',
    Android = 'Android',
    Any = 'ANY',
}

export enum SuggestionSource {
    Backlog = 'BACKLOG',
    Owned = 'OWNED',
    AlreadyPlayed = 'ALREADY_PLAYED',
    NewSuggestion = 'NEW_SUGGESTION',
}

export const LibraryStatusLabels: Record<LibraryStatus, string> = {
    [LibraryStatus.Wishlist]: 'Wishlist',
    [LibraryStatus.Backlog]: 'Backlog',
    [LibraryStatus.Playing]: 'Playing',
    [LibraryStatus.Played]: 'Played',
    [LibraryStatus.Finished]: 'Finished',
    [LibraryStatus.Completed]: 'Completed',
    [LibraryStatus.Abandoned]: 'Abandoned',
};
