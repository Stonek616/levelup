import type { Meta, StoryObj } from '@storybook/angular';
import { FindFriendsComponent } from './find-friends.component';

const meta: Meta<FindFriendsComponent> = {
  title: 'Pages/Friends/FindFriends',
  component: FindFriendsComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<FindFriendsComponent>;

export const Default: Story = {};
