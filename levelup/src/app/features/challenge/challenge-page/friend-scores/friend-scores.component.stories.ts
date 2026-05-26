import type { Meta, StoryObj } from '@storybook/angular';
import { FriendScoresComponent } from './friend-scores.component';

const meta: Meta<FriendScoresComponent> = {
  title: 'Features/Challenge/FriendScores',
  component: FriendScoresComponent,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<FriendScoresComponent>;

export const Empty: Story = {
  name: 'No friends have played',
  args: { scores: [] },
};

export const OneScore: Story = {
  name: 'One friend score',
  args: {
    scores: [
      { username: 'bestfriend', avatarUrl: null, score: 80, completedAt: '2024-05-20T14:00:00Z' },
    ],
  },
};

export const MultipleScores: Story = {
  name: 'Multiple friend scores',
  args: {
    scores: [
      { username: 'perfectionist', avatarUrl: null, score: 100, completedAt: '2024-05-20T08:00:00Z' },
      { username: 'goodgamer', avatarUrl: null, score: 80, completedAt: '2024-05-20T10:00:00Z' },
      { username: 'triedhard', avatarUrl: null, score: 60, completedAt: '2024-05-20T12:00:00Z' },
      { username: 'struggling', avatarUrl: null, score: 20, completedAt: '2024-05-20T15:00:00Z' },
    ],
  },
};

export const WithAvatars: Story = {
  name: 'Friends with avatars',
  args: {
    scores: [
      { username: 'player_one', avatarUrl: 'https://i.pravatar.cc/40?img=3', score: 100, completedAt: '2024-05-20T09:00:00Z' },
      { username: 'player_two', avatarUrl: 'https://i.pravatar.cc/40?img=7', score: 60, completedAt: '2024-05-20T11:30:00Z' },
    ],
  },
};
