import type { Meta, StoryObj } from '@storybook/angular';
import { FriendListComponent } from './friend-list.component';

const meta: Meta<FriendListComponent> = {
  title: 'Pages/Friends/FriendList',
  component: FriendListComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<FriendListComponent>;

export const Loading: Story = {};
