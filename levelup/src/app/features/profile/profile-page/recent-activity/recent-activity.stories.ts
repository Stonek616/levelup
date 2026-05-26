import type { Meta, StoryObj } from '@storybook/angular';
import { RecentActivityComponent } from './recent-activity.component';

const meta: Meta<RecentActivityComponent> = {
  title: 'Pages/Profile/RecentActivity',
  component: RecentActivityComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<RecentActivityComponent>;

export const Default: Story = {};
