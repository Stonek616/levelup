import type { Meta, StoryObj } from '@storybook/angular';
import { AvatarComponent } from './avatar.component';

const meta: Meta<AvatarComponent> = {
  title: 'Shared/Avatar',
  component: AvatarComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    avatarUrl: { control: 'text' },
    username: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<AvatarComponent>;

export const SmallNoAvatar: Story = {
  name: 'Small — no avatar (initials fallback)',
  args: { size: 'sm', avatarUrl: null, username: 'gamer42' },
};

export const MediumNoAvatar: Story = {
  name: 'Medium — no avatar (initials fallback)',
  args: { size: 'md', avatarUrl: null, username: 'gamer42' },
};

export const LargeNoAvatar: Story = {
  name: 'Large — no avatar (initials fallback)',
  args: { size: 'lg', avatarUrl: null, username: 'gamer42' },
};

export const WithAvatar: Story = {
  name: 'With avatar URL',
  args: {
    size: 'md',
    avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=gamer42',
    username: 'gamer42',
  },
};

export const LongUsername: Story = {
  name: 'Long username (truncation)',
  args: {
    size: 'md',
    avatarUrl: null,
    username: 'superlongusernamethatislong',
  },
};
