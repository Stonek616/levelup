export interface ChallengeRoundGame {
  gameId: string;
  title: string;
  coverUrl: string | null;
}

export interface ChallengeRound {
  roundNumber: number;
  games: ChallengeRoundGame[];
}

export interface ChallengePayload {
  rounds: ChallengeRound[];
}

export interface DailyChallenge {
  id: string;
  challengeDate: string;
  challengeType: string;
  payload: ChallengePayload;
  completed: false;
  friendCompletedCount: number;
}

export interface CompletedChallenge {
  id: string;
  challengeDate: string;
  challengeType: string;
  completed: true;
  result: ChallengeResult;
  friendScores: FriendChallengeScore[];
}

export type ChallengeResponse = DailyChallenge | CompletedChallenge;

export interface ChallengeResult {
  score: number;
  shareText: string;
  completedAt: string;
  friendScores: FriendChallengeScore[];
}

export interface FriendChallengeScore {
  username: string;
  avatarUrl: string | null;
  score: number;
  completedAt: string;
}

export interface SubmitChallengeRequest {
  answer: {
    roundAnswers: number[];
  };
}

export interface ChallengeHistory {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  history: {
    content: ChallengeHistoryEntry[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

export interface ChallengeHistoryEntry {
  challengeDate: string;
  score: number;
  completedAt: string;
}
