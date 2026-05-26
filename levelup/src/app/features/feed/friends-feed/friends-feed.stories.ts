import type { Meta, StoryObj } from '@storybook/angular';
import { FriendsFeedComponent } from './friends-feed.component';

const meta: Meta<FriendsFeedComponent> = {
  title: 'Pages/Feed/FriendsFeed',
  component: FriendsFeedComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<FriendsFeedComponent>;

export const Loading: Story = {};
