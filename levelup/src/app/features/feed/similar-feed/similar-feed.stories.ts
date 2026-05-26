import type { Meta, StoryObj } from '@storybook/angular';
import { SimilarFeedComponent } from './similar-feed.component';

const meta: Meta<SimilarFeedComponent> = {
  title: 'Pages/Feed/SimilarFeed',
  component: SimilarFeedComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<SimilarFeedComponent>;

export const Loading: Story = {};
