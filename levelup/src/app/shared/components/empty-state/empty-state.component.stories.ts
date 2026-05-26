import type { Meta, StoryObj } from '@storybook/angular';
import { EmptyStateComponent } from './empty-state.component';

const meta: Meta<EmptyStateComponent> = {
  title: 'Shared/EmptyState',
  component: EmptyStateComponent,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    icon: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<EmptyStateComponent>;

export const Default: Story = {
  args: {
    title: 'Nothing here yet',
    message: null,
    icon: null,
  },
};

export const WithIcon: Story = {
  name: 'With emoji icon',
  args: {
    title: 'Your library is empty',
    message: 'Search for games and add them to start tracking your collection.',
    icon: '🎮',
  },
};

export const NoFriends: Story = {
  name: 'No friends state',
  args: {
    title: 'No friends yet',
    message: 'Search for players by username to send friend requests.',
    icon: '👥',
  },
};

export const NoResults: Story = {
  name: 'No search results',
  args: {
    title: 'No results found',
    message: 'Try a different search term.',
    icon: '🔍',
  },
};

export const NoChallenges: Story = {
  name: 'No challenge history',
  args: {
    title: 'No challenges completed yet',
    message: "Complete today's daily challenge to start building your streak.",
    icon: '⚡',
  },
};
