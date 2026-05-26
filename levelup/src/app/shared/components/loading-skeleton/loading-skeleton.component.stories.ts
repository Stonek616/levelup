import type { Meta, StoryObj } from '@storybook/angular';
import { LoadingSkeletonComponent } from './loading-skeleton.component';

const meta: Meta<LoadingSkeletonComponent> = {
  title: 'Shared/LoadingSkeleton',
  component: LoadingSkeletonComponent,
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'text' },
    height: { control: 'text' },
    rounded: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<LoadingSkeletonComponent>;

export const TextLine: Story = {
  name: 'Text line (default)',
  args: { width: '100%', height: '16px', rounded: false },
};

export const ShortLine: Story = {
  name: 'Short line (60%)',
  args: { width: '60%', height: '16px', rounded: false },
};

export const Heading: Story = {
  name: 'Heading size',
  args: { width: '40%', height: '28px', rounded: false },
};

export const CoverImage: Story = {
  name: 'Game cover image',
  args: { width: '120px', height: '160px', rounded: false },
};

export const Avatar: Story = {
  name: 'Avatar (rounded)',
  args: { width: '48px', height: '48px', rounded: true },
};

export const Button: Story = {
  name: 'Button shape',
  args: { width: '120px', height: '40px', rounded: false },
};
