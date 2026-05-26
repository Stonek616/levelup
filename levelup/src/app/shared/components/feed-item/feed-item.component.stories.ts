import type { Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { FeedItemComponent } from './feed-item.component';

const meta: Meta<FeedItemComponent> = {
  title: 'Shared/FeedItem',
  component: FeedItemComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: [provideRouter([])] }),
  ],
};
export default meta;

type Story = StoryObj<FeedItemComponent>;

const baseUser = {
  id: 'user-1',
  username: 'alex_gamer',
  avatarUrl: null,
};

const baseGame = {
  id: 'game-1',
  slug: 'hollow-knight',
  title: 'Hollow Knight',
  coverImageId: null,
};

export const StatusChange: Story = {
  name: 'STATUS_CHANGE — Backlog → Playing',
  args: {
    event: {
      id: 'evt-1',
      type: 'STATUS_CHANGE',
      user: baseUser,
      game: baseGame,
      metadata: JSON.stringify({ oldStatus: 'BACKLOG', newStatus: 'PLAYING' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  },
};

export const StatusChangeToCompleted: Story = {
  name: 'STATUS_CHANGE — Playing → Completed',
  args: {
    event: {
      id: 'evt-2',
      type: 'STATUS_CHANGE',
      user: { ...baseUser, username: 'mari0_fan' },
      game: { ...baseGame, title: 'Super Mario Odyssey', slug: 'super-mario-odyssey' },
      metadata: JSON.stringify({ oldStatus: 'PLAYING', newStatus: 'COMPLETED' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  },
};

export const RatingAdded: Story = {
  name: 'RATING_ADDED — rated 8/10',
  args: {
    event: {
      id: 'evt-3',
      type: 'RATING_ADDED',
      user: baseUser,
      game: baseGame,
      metadata: JSON.stringify({ rating: 8 }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  },
};

export const RatingPerfect: Story = {
  name: 'RATING_ADDED — rated 10/10',
  args: {
    event: {
      id: 'evt-4',
      type: 'RATING_ADDED',
      user: { ...baseUser, username: 'perfectionist99' },
      game: { ...baseGame, title: 'Elden Ring', slug: 'elden-ring' },
      metadata: JSON.stringify({ rating: 10 }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  },
};

export const ReviewPosted: Story = {
  name: 'REVIEW_POSTED',
  args: {
    event: {
      id: 'evt-5',
      type: 'REVIEW_POSTED',
      user: { ...baseUser, username: 'critic_sam' },
      game: { id: 'game-2', slug: 'disco-elysium', title: 'Disco Elysium', coverImageId: null },
      metadata: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  },
};

export const CollectionCreated: Story = {
  name: 'COLLECTION_CREATED',
  args: {
    event: {
      id: 'evt-6',
      type: 'COLLECTION_CREATED',
      user: baseUser,
      game: baseGame,
      metadata: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
  },
};

export const GameAdded: Story = {
  name: 'GAME_ADDED — added to library as Backlog',
  args: {
    event: {
      id: 'evt-7',
      type: 'GAME_ADDED',
      user: baseUser,
      game: { id: 'game-3', slug: 'hades', title: 'Hades', coverImageId: null },
      metadata: JSON.stringify({ status: 'BACKLOG' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  },
};

export const WithAvatar: Story = {
  name: 'With user avatar',
  args: {
    event: {
      id: 'evt-8',
      type: 'RATING_ADDED',
      user: {
        id: 'user-2',
        username: 'avatar_user',
        avatarUrl: 'https://i.pravatar.cc/40?img=12',
      },
      game: baseGame,
      metadata: JSON.stringify({ rating: 7 }),
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  },
};
