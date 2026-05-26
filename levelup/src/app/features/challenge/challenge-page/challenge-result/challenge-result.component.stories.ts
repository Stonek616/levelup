import type { Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { ChallengeResultComponent } from './challenge-result.component';

const meta: Meta<ChallengeResultComponent> = {
  title: 'Features/Challenge/ChallengeResult',
  component: ChallengeResultComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: [provideRouter([])] }),
  ],
};
export default meta;

type Story = StoryObj<ChallengeResultComponent>;

const baseFriendScores = [
  { username: 'buddy99', avatarUrl: null, score: 80, completedAt: '2024-05-20T09:00:00Z' },
  { username: 'casual_gamer', avatarUrl: null, score: 40, completedAt: '2024-05-20T11:00:00Z' },
];

export const PerfectScore: Story = {
  name: 'Perfect score — 100/100',
  args: {
    result: {
      score: 100,
      shareText: 'I scored 100/100 on today\'s LevelUp Challenge! 🎮 #LevelUpChallenge',
      completedAt: '2024-05-20T10:00:00Z',
      friendScores: baseFriendScores,
    },
    friendScores: baseFriendScores,
  },
};

export const GreatScore: Story = {
  name: 'Great score — 80/100',
  args: {
    result: {
      score: 80,
      shareText: 'I scored 80/100 on today\'s LevelUp Challenge! 🎮 #LevelUpChallenge',
      completedAt: '2024-05-20T10:30:00Z',
      friendScores: baseFriendScores,
    },
    friendScores: baseFriendScores,
  },
};

export const GoodEffort: Story = {
  name: 'Good effort — 60/100',
  args: {
    result: {
      score: 60,
      shareText: 'I scored 60/100 on today\'s LevelUp Challenge! 🎮 #LevelUpChallenge',
      completedAt: '2024-05-20T11:00:00Z',
      friendScores: [],
    },
    friendScores: [],
  },
};

export const LowScore: Story = {
  name: 'Low score — 20/100',
  args: {
    result: {
      score: 20,
      shareText: 'I scored 20/100 on today\'s LevelUp Challenge! 🎮 #LevelUpChallenge',
      completedAt: '2024-05-20T11:30:00Z',
      friendScores: [],
    },
    friendScores: [],
  },
};

export const NoFriends: Story = {
  name: 'No friends have played',
  args: {
    result: {
      score: 80,
      shareText: 'I scored 80/100 on today\'s LevelUp Challenge! 🎮 #LevelUpChallenge',
      completedAt: '2024-05-20T10:00:00Z',
      friendScores: [],
    },
    friendScores: [],
  },
};
