import type { Meta, StoryObj } from '@storybook/angular';
import { ForYouFeedComponent } from './for-you-feed.component';

const meta: Meta<ForYouFeedComponent> = {
  title: 'Pages/Feed/ForYouFeed',
  component: ForYouFeedComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<ForYouFeedComponent>;

export const Loading: Story = {};
