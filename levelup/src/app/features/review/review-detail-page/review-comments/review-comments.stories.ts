import type { Meta, StoryObj } from '@storybook/angular';
import { ReviewCommentsComponent } from './review-comments.component';

const meta: Meta<ReviewCommentsComponent> = {
  title: 'Pages/Review/ReviewComments',
  component: ReviewCommentsComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<ReviewCommentsComponent>;

export const Default: Story = {
  args: { reviewId: 'review-123' },
};
