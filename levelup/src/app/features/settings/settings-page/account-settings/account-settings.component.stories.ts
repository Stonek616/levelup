import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { applicationConfig } from '@storybook/angular';
import { of, throwError } from 'rxjs';
import { AccountSettingsComponent } from './account-settings.component';
import { SettingsService } from '../../../../core/services/settings.service';
import { UserService } from '../../../../core/services/user.service';

const mockProfile = {
  id: 'user-1',
  username: 'gamer99',
  email: 'gamer@example.com',
  bio: 'Lover of RPGs and retro games.',
  avatarUrl: null,
  onboardingCompleted: true,
  createdAt: '2023-01-01T00:00:00Z',
  libraryCount: 120,
  completedCount: 25,
  reviewCount: 18,
  isFriend: false,
  friendRequestStatus: null,
};

const mockUserService = {
  currentUser: signal({
    id: 'user-1',
    username: 'gamer99',
    email: 'gamer@example.com',
  }),
  getMyProfile: () => of(mockProfile),
};

const mockSettingsServiceSuccess = {
  updateAccount: (_req: any) => of(mockProfile),
};

const mockSettingsServiceError = {
  updateAccount: (_req: any) =>
    throwError(() => ({ error: { message: 'Username already taken.' } })),
};

const meta: Meta<AccountSettingsComponent> = {
  title: 'Features/Settings/AccountSettings',
  component: AccountSettingsComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: SettingsService, useValue: mockSettingsServiceSuccess },
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj<AccountSettingsComponent>;

export const Default: Story = {
  name: 'Form pre-filled from profile',
};

export const SaveError: Story = {
  name: 'Save fails — username taken',
  decorators: [
    applicationConfig({
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: SettingsService, useValue: mockSettingsServiceError },
      ],
    }),
  ],
};
