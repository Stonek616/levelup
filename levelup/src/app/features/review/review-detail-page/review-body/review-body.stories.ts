import type { Meta, StoryObj } from '@storybook/angular';
import { ReviewBodyComponent } from './review-body.component';
import { Review } from '../../../../core/models/review.model';

const meta: Meta<ReviewBodyComponent> = {
  title: 'Pages/Review/ReviewBody',
  component: ReviewBodyComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<ReviewBodyComponent>;

const mockReview: Review = {
  id: 'r1',
  author: { id: 'u1', username: 'player1', avatarUrl: null },
  game: { id: 'g1', slug: 'elden-ring', title: 'Elden Ring' },
  body: 'An incredible open-world experience that sets a new standard for the genre. The boss fights are challenging but incredibly rewarding, and the world design is unlike anything I have experienced before. A masterpiece.',
  rating: 9,
  likeCount: 42,
  commentCount: 7,
  likedByMe: false,
  isFriendReview: false,
  createdAt: '2024-03-15T10:00:00Z',
  updatedAt: '2024-03-15T10:00:00Z',
};

export const Default: Story = {
  args: { review: mockReview },
};

export const Liked: Story = {
  args: { review: { ...mockReview, likedByMe: true, likeCount: 43 } },
};

export const NoRating: Story = {
  args: { review: { ...mockReview, rating: null } },
};
