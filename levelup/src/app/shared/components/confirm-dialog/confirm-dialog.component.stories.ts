import type { Meta, StoryObj } from '@storybook/angular';
import { ConfirmDialogComponent } from './confirm-dialog.component';

const meta: Meta<ConfirmDialogComponent> = {
  title: 'Shared/ConfirmDialog',
  component: ConfirmDialogComponent,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
    message: { control: 'text' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<ConfirmDialogComponent>;

export const Closed: Story = {
  name: 'Closed (not visible)',
  args: {
    open: false,
    title: 'Remove from library?',
    message: 'This will remove the game and all your progress data for it.',
    confirmLabel: 'Remove',
    cancelLabel: 'Cancel',
  },
};

export const Open: Story = {
  name: 'Open — destructive action',
  args: {
    open: true,
    title: 'Remove from library?',
    message: 'This will remove the game and all your progress data for it.',
    confirmLabel: 'Remove',
    cancelLabel: 'Cancel',
  },
};

export const DeleteAccount: Story = {
  name: 'Open — delete account',
  args: {
    open: true,
    title: 'Delete your account?',
    message: 'Your account will be permanently deleted after 30 days. This action cannot be undone.',
    confirmLabel: 'Delete account',
    cancelLabel: 'Keep my account',
  },
};

export const RemoveFriend: Story = {
  name: 'Open — remove friend',
  args: {
    open: true,
    title: 'Remove friend?',
    message: 'You will no longer see each other\'s activity in your feeds.',
    confirmLabel: 'Remove',
    cancelLabel: 'Cancel',
  },
};
