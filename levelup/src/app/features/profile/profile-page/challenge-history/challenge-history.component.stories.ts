import type { Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { of } from 'rxjs';
import { ChallengeHistoryComponent } from './challenge-history.component';
import { ChallengeService } from '../../../../core/services/challenge.service';

const mockHistoryData = {
  currentStreak: 7,
  longestStreak: 14,
  totalCompleted: 42,
  history: {
    content: [
      { challengeDate: '2024-05-20', score: 100, completedAt: '2024-05-20T10:00:00Z' },
      { challengeDate: '2024-05-19', score: 80, completedAt: '2024-05-19T09:30:00Z' },
      { challengeDate: '2024-05-18', score: 60, completedAt: '2024-05-18T14:00:00Z' },
      { challengeDate: '2024-05-17', score: 40, completedAt: '2024-05-17T11:00:00Z' },
      { challengeDate: '2024-05-16', score: 100, completedAt: '2024-05-16T08:00:00Z' },
      { challengeDate: '2024-05-15', score: 80, completedAt: '2024-05-15T16:00:00Z' },
      { challengeDate: '2024-05-14', score: 20, completedAt: '2024-05-14T19:00:00Z' },
    ],
    page: 0,
    size: 10,
    totalElements: 42,
    totalPages: 5,
    last: false,
  },
};

const mockChallengeServiceWithData = {
  getHistory: () => of(mockHistoryData),
};

const mockChallengeServiceEmpty = {
  getHistory: () => of({
    currentStreak: 0,
    longestStreak: 3,
    totalCompleted: 0,
    history: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, last: true },
  }),
};

const meta: Meta<ChallengeHistoryComponent> = {
  title: 'Pages/Profile/ChallengeHistory',
  component: ChallengeHistoryComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: ChallengeService, useValue: mockChallengeServiceWithData },
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj<ChallengeHistoryComponent>;

export const OwnProfile: Story = {
  name: 'Own profile — with history',
  args: { isOwnProfile: true },
};

export const OwnProfileEmpty: Story = {
  name: 'Own profile — no history yet',
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: ChallengeService, useValue: mockChallengeServiceEmpty },
      ],
    }),
  ],
  args: { isOwnProfile: true },
};

export const OtherProfile: Story = {
  name: 'Other user\'s profile (hidden)',
  args: { isOwnProfile: false },
};
