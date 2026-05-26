import type { Meta, StoryObj } from '@storybook/angular';
import { FeedPageComponent } from './feed-page.component';

const meta: Meta<FeedPageComponent> = {
  title: 'Pages/Feed/FeedPage',
  component: FeedPageComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<FeedPageComponent>;

export const Default: Story = {};
