import type { Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { GameCardComponent } from './game-card.component';
import { LibraryStatus } from '../../../core/models/enums';

const meta: Meta<GameCardComponent> = {
  title: 'Shared/GameCard',
  component: GameCardComponent,
  tags: ['autodocs'],
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};
export default meta;

type Story = StoryObj<GameCardComponent>;

const baseSummary = {
  id: 'game-1',
  igdbId: 1234,
  slug: 'the-witcher-3',
  title: 'The Witcher 3: Wild Hunt',
  coverImageId: null,
  releaseYear: 2015,
  platforms: ['PC', 'PS4', 'XBOXONE'],
};

export const GameKindNoCover: Story = {
  name: 'Game — no cover image',
  args: {
    card: { kind: 'game', data: baseSummary },
  },
};

export const GameKindWithCover: Story = {
  name: 'Game — with cover image',
  args: {
    card: {
      kind: 'game',
      data: { ...baseSummary, coverImageId: 'co1wyy' },
    },
  },
};

export const GameKindNoYear: Story = {
  name: 'Game — no release year',
  args: {
    card: {
      kind: 'game',
      data: { ...baseSummary, releaseYear: null },
    },
  },
};

export const EntryPlaying: Story = {
  name: 'Library entry — Playing (owned)',
  args: {
    card: {
      kind: 'entry',
      data: {
        id: 'entry-1',
        game: baseSummary,
        status: LibraryStatus.Playing,
        ownership: 'OWNED',
        platforms: ['PC'],
        rating: null,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-20T14:00:00Z',
      },
    },
  },
};

export const EntryCompleted: Story = {
  name: 'Library entry — Completed with rating',
  args: {
    card: {
      kind: 'entry',
      data: {
        id: 'entry-2',
        game: { ...baseSummary, coverImageId: 'co1wyy' },
        status: LibraryStatus.Completed,
        ownership: 'OWNED',
        platforms: ['PS4'],
        rating: 9,
        createdAt: '2023-06-01T09:00:00Z',
        updatedAt: '2023-08-10T17:00:00Z',
      },
    },
  },
};

export const EntryBacklogUnowned: Story = {
  name: 'Library entry — Backlog (unowned)',
  args: {
    card: {
      kind: 'entry',
      data: {
        id: 'entry-3',
        game: baseSummary,
        status: LibraryStatus.Backlog,
        ownership: 'NONE',
        platforms: [],
        rating: null,
        createdAt: '2024-05-01T08:00:00Z',
        updatedAt: '2024-05-01T08:00:00Z',
      },
    },
  },
};

export const EntryWishlist: Story = {
  name: 'Library entry — Wishlist',
  args: {
    card: {
      kind: 'entry',
      data: {
        id: 'entry-4',
        game: baseSummary,
        status: null,
        ownership: 'WISHLIST',
        platforms: [],
        rating: null,
        createdAt: '2024-02-10T12:00:00Z',
        updatedAt: '2024-02-10T12:00:00Z',
      },
    },
  },
};

export const EntryAbandoned: Story = {
  name: 'Library entry — Abandoned with low rating',
  args: {
    card: {
      kind: 'entry',
      data: {
        id: 'entry-5',
        game: baseSummary,
        status: LibraryStatus.Abandoned,
        ownership: 'OWNED',
        platforms: ['PC'],
        rating: 3,
        createdAt: '2022-11-01T10:00:00Z',
        updatedAt: '2023-01-05T09:00:00Z',
      },
    },
  },
};

export const LongTitle: Story = {
  name: 'Long game title (text overflow)',
  args: {
    card: {
      kind: 'game',
      data: {
        ...baseSummary,
        title:
          'The Elder Scrolls V: Skyrim Anniversary Edition Special Remastered',
      },
    },
  },
};
