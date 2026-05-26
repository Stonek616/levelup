import type { Meta, StoryObj } from '@storybook/angular';
import { RatingStarsComponent } from './rating-stars.component';

const meta: Meta<RatingStarsComponent> = {
  title: 'Shared/RatingStars',
  component: RatingStarsComponent,
  tags: ['autodocs'],
  argTypes: {
    rating: { control: { type: 'number', min: 1, max: 10 } },
    readonly: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<RatingStarsComponent>;

export const Unrated: Story = {
  name: 'No rating (interactive)',
  args: { rating: null, readonly: false },
};

export const LowRating: Story = {
  name: 'Rating 3/10',
  args: { rating: 3, readonly: false },
};

export const MidRating: Story = {
  name: 'Rating 6/10',
  args: { rating: 6, readonly: false },
};

export const HighRating: Story = {
  name: 'Rating 9/10',
  args: { rating: 9, readonly: false },
};

export const Perfect: Story = {
  name: 'Rating 10/10',
  args: { rating: 10, readonly: false },
};

export const ReadonlyRated: Story = {
  name: 'Readonly — rating 8/10',
  args: { rating: 8, readonly: true },
};

export const ReadonlyUnrated: Story = {
  name: 'Readonly — no rating',
  args: { rating: null, readonly: true },
};
