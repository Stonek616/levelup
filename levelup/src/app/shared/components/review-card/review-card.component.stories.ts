import type { Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { ReviewCardComponent } from './review-card.component';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';

const mockReviewService = {
  likeReview: (id: string) => of({ likeCount: 1, likedByMe: true }),
  unlikeReview: (id: string) => of({ likeCount: 0, likedByMe: false }),
};

const mockAuthServiceLoggedIn = {
  isAuthenticated: () => signal({ id: 'user-1', username: 'me' }),
  currentUser: signal({ id: 'user-1', username: 'me' }),
};

const mockAuthServiceLoggedOut = {
  isAuthenticated: () => signal(null),
  currentUser: signal(null),
};

const baseReview = {
  id: 'review-1',
  author: {
    id: 'user-1',
    username: 'alex_gamer',
    avatarUrl: null,
  },
  game: {
    id: 'game-1',
    slug: 'hollow-knight',
    title: 'Hollow Knight',
  },
  body: 'An absolutely stunning metroidvania that redefines the genre. The world-building is extraordinary, combat is tight and rewarding, and the atmosphere is unmatched. A must-play for any fan of the genre.',
  rating: 9,
  likeCount: 42,
  commentCount: 8,
  likedByMe: false,
  isFriendReview: false,
  createdAt: '2024-03-15T10:00:00Z',
  updatedAt: '2024-03-15T10:00:00Z',
};

const meta: Meta<ReviewCardComponent> = {
  title: 'Shared/ReviewCard',
  component: ReviewCardComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: ReviewService, useValue: mockReviewService },
        { provide: AuthService, useValue: mockAuthServiceLoggedIn },
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj<ReviewCardComponent>;

export const WithRating: Story = {
  name: 'Review with rating (logged in)',
  args: { review: baseReview },
};

export const NoRating: Story = {
  name: 'Review — no rating',
  args: {
    review: { ...baseReview, rating: null, id: 'review-2' },
  },
};

export const LikedByMe: Story = {
  name: 'Already liked by current user',
  args: {
    review: { ...baseReview, likedByMe: true, likeCount: 43, id: 'review-3' },
  },
};

export const FriendReview: Story = {
  name: 'Friend review (isFriendReview flag)',
  args: {
    review: {
      ...baseReview,
      isFriendReview: true,
      author: { id: 'user-2', username: 'bestfriend99', avatarUrl: null },
      id: 'review-4',
    },
  },
};

export const ManyLikes: Story = {
  name: 'Popular review — many likes',
  args: {
    review: { ...baseReview, likeCount: 1204, commentCount: 93, id: 'review-5' },
  },
};

export const ShortReview: Story = {
  name: 'Short review body',
  args: {
    review: {
      ...baseReview,
      body: 'Masterpiece.',
      rating: 10,
      id: 'review-6',
    },
  },
};

export const LongReview: Story = {
  name: 'Long review body',
  args: {
    review: {
      ...baseReview,
      body: `This game fundamentally changed how I think about game design. From the moment you drop into Hallownest you are greeted by an oppressive silence broken only by the ambient sounds of a decaying kingdom. The developers at Team Cherry have crafted something truly remarkable here — every room tells a story, every enemy has a history, and every boss feels like a genuine encounter rather than an obstacle.\n\nThe combat system is deceptively simple on the surface but rewards mastery in ways few games do. Learning the timing of each boss phase, discovering which charms synergise with your playstyle, and that glorious moment when you finally beat a boss you've been struggling with for hours — it's all there.\n\nI could write paragraphs about the music alone. Christopher Larkin's score is nothing short of extraordinary.`,
      id: 'review-7',
    },
  },
};

export const LoggedOutUser: Story = {
  name: 'Logged-out viewer (cannot like)',
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: ReviewService, useValue: mockReviewService },
        { provide: AuthService, useValue: mockAuthServiceLoggedOut },
      ],
    }),
  ],
  args: { review: baseReview },
};

export const WithAvatar: Story = {
  name: 'Author with avatar',
  args: {
    review: {
      ...baseReview,
      author: {
        id: 'user-3',
        username: 'avatar_reviewer',
        avatarUrl: 'https://i.pravatar.cc/40?img=5',
      },
      id: 'review-8',
    },
  },
};
