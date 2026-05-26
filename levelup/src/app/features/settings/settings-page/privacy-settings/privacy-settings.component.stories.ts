import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { applicationConfig } from '@storybook/angular';
import { of } from 'rxjs';
import { PrivacySettingsComponent } from './privacy-settings.component';
import { SettingsService } from '../../../../core/services/settings.service';
import { UserService } from '../../../../core/services/user.service';
import { VisibilityType } from '../../../../core/models/enums';

const mockProfile = {
  id: 'user-1',
  username: 'gamer99',
  bio: null,
  avatarUrl: null,
  onboardingCompleted: true,
  createdAt: '2023-01-01T00:00:00Z',
  libraryCount: 120,
  completedCount: 25,
  reviewCount: 18,
  isFriend: false,
  friendRequestStatus: null,
  libraryVisibility: VisibilityType.Public,
  wishlistVisibility: VisibilityType.Friends,
  reviewsVisibility: VisibilityType.Public,
};

const mockUserService = {
  currentUser: signal({ id: 'user-1', username: 'gamer99' }),
  getMyProfile: () => of(mockProfile),
};

const mockSettingsService = {
  updatePrivacy: (_req: any) => of({}),
};

const meta: Meta<PrivacySettingsComponent> = {
  title: 'Features/Settings/PrivacySettings',
  component: PrivacySettingsComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj<PrivacySettingsComponent>;

export const Default: Story = {
  name: 'Default visibility settings',
};

export const PrivateProfile: Story = {
  name: 'All private',
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: signal({ id: 'user-1', username: 'ghost_user' }),
            getMyProfile: () =>
              of({
                ...mockProfile,
                libraryVisibility: VisibilityType.Private,
                wishlistVisibility: VisibilityType.Private,
                reviewsVisibility: VisibilityType.Private,
              }),
          },
        },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }),
  ],
};
