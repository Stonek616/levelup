import type { Meta, StoryObj } from '@storybook/angular';
import { UserGameActionsComponent } from './user-game-actions.component';

const meta: Meta<UserGameActionsComponent> = {
  title: 'Pages/Library/UserGameActions',
  component: UserGameActionsComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<UserGameActionsComponent>;

export const Default: Story = {
  args: {
    gameId: 'game-123',
    gamePlatforms: ['PC', 'PS5', 'Xbox Series X'],
  },
};

export const NoPlatforms: Story = {
  args: {
    gameId: 'game-456',
    gamePlatforms: [],
  },
};
