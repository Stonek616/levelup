import type { Meta, StoryObj } from '@storybook/angular';
import { GameReviewsComponent } from './game-reviews.component';

const meta: Meta<GameReviewsComponent> = {
  title: 'Pages/Library/GameReviews',
  component: GameReviewsComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<GameReviewsComponent>;

export const Default: Story = {
  args: { gameId: 'game-123' },
};
