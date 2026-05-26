import type { Meta, StoryObj } from '@storybook/angular';
import { TasteProfileComponent } from './taste-profile.component';
import { TasteProfile } from '../../../../core/models/user.model';

const meta: Meta<TasteProfileComponent> = {
  title: 'Pages/Profile/TasteProfile',
  component: TasteProfileComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<TasteProfileComponent>;

const mockTasteProfile: TasteProfile = {
  username: 'player1',
  genres: [
    { name: 'RPG', count: 15, percentage: 45 },
    { name: 'Action', count: 10, percentage: 30 },
    { name: 'Strategy', count: 8, percentage: 25 },
  ],
  topTags: ['open-world', 'story-rich', 'fantasy', 'singleplayer'],
  topPlatforms: ['PC', 'PS5'],
  averageRating: 7.8,
  totalRated: 33,
  compatibility: null,
};

export const OwnProfile: Story = {
  args: { tasteProfile: mockTasteProfile },
};

export const WithCompatibility: Story = {
  args: {
    tasteProfile: { ...mockTasteProfile, compatibility: 82 },
  },
};
