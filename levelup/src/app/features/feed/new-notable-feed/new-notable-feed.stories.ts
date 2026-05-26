import type { Meta, StoryObj } from '@storybook/angular';
import { NewNotableFeedComponent } from './new-notable-feed.component';

const meta: Meta<NewNotableFeedComponent> = {
  title: 'Pages/Feed/NewNotableFeed',
  component: NewNotableFeedComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<NewNotableFeedComponent>;

export const Loading: Story = {};
