import type { Meta, StoryObj } from '@storybook/angular';
import { FriendsPageComponent } from './friends-page.component';

const meta: Meta<FriendsPageComponent> = {
  title: 'Pages/Friends/FriendsPage',
  component: FriendsPageComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<FriendsPageComponent>;

export const Default: Story = {};
