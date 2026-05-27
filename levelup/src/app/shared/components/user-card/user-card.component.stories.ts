import type { Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { of } from 'rxjs';
import { UserCardComponent } from './user-card.component';
import { FriendService } from '../../../core/services/friend.service';

const mockFriendService = {
  sendFriendRequest: (_userId: string) => of({ status: 'PENDING' }),
  removeFriend: (_userId: string) => of(void 0),
};

const meta: Meta<UserCardComponent> = {
  title: 'Shared/UserCard',
  component: UserCardComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: FriendService, useValue: mockFriendService },
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj<UserCardComponent>;

export const Stranger: Story = {
  name: 'Stranger — no relationship',
  args: {
    user: {
      id: 'user-1',
      username: 'cool_gamer',
      avatarUrl: null,
      isFriend: false,
      friendRequestStatus: null,
    },
  },
};

export const Friend: Story = {
  name: 'Existing friend',
  args: {
    user: {
      id: 'user-2',
      username: 'best_friend',
      avatarUrl: null,
      isFriend: true,
      friendRequestStatus: 'ACCEPTED',
    },
  },
};

export const PendingRequest: Story = {
  name: 'Pending outgoing friend request',
  args: {
    user: {
      id: 'user-3',
      username: 'pending_pal',
      avatarUrl: null,
      isFriend: false,
      friendRequestStatus: 'PENDING',
    },
  },
};

export const WithAvatar: Story = {
  name: 'User with avatar',
  args: {
    user: {
      id: 'user-4',
      username: 'avatar_person',
      avatarUrl: 'https://i.pravatar.cc/64?img=8',
      isFriend: false,
      friendRequestStatus: null,
    },
  },
};

export const FriendWithAvatar: Story = {
  name: 'Friend with avatar',
  args: {
    user: {
      id: 'user-5',
      username: 'friendly_avatar',
      avatarUrl: 'https://i.pravatar.cc/64?img=22',
      isFriend: true,
      friendRequestStatus: 'ACCEPTED',
    },
  },
};

export const LongUsername: Story = {
  name: 'Long username (overflow)',
  args: {
    user: {
      id: 'user-6',
      username: 'this_is_a_very_long_username_that_might_overflow',
      avatarUrl: null,
      isFriend: false,
      friendRequestStatus: null,
    },
  },
};
