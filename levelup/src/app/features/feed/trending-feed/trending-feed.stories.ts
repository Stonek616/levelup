import type { Meta, StoryObj } from '@storybook/angular';
import { TrendingFeedComponent } from './trending-feed.component';

const meta: Meta<TrendingFeedComponent> = {
  title: 'Pages/Feed/TrendingFeed',
  component: TrendingFeedComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<TrendingFeedComponent>;

export const Loading: Story = {};
