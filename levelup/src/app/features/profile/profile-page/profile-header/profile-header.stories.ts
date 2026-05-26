import type { Meta, StoryObj } from '@storybook/angular';
import { ProfileHeaderComponent } from './profile-header.component';
import { UserProfile } from '../../../../core/models/user.model';

const meta: Meta<ProfileHeaderComponent> = {
  title: 'Pages/Profile/ProfileHeader',
  component: ProfileHeaderComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<ProfileHeaderComponent>;

const mockProfile: UserProfile = {
  id: 'u1',
  username: 'player1',
  bio: 'RPG enthusiast and occasional speedrunner. Currently playing through my backlog.',
  avatarUrl: null,
  createdAt: '2023-06-15T00:00:00Z',
  libraryCount: 142,
  completedCount: 28,
  reviewCount: 35,
  friendCount: 12,
  isFriend: false,
  friendRequestStatus: null,
};

export const Default: Story = {
  args: { profile: mockProfile },
};

export const Friend: Story = {
  args: {
    profile: {
      ...mockProfile,
      isFriend: true,
      friendRequestStatus: 'ACCEPTED',
    },
  },
};

export const PendingRequest: Story = {
  args: {
    profile: { ...mockProfile, friendRequestStatus: 'PENDING' },
  },
};

export const WithAvatar: Story = {
  args: {
    profile: { ...mockProfile, avatarUrl: 'https://i.pravatar.cc/150?img=8' },
  },
};

export const NoBio: Story = {
  args: {
    profile: { ...mockProfile, bio: null },
  },
};
