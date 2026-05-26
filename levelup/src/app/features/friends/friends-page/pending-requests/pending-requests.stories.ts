import type { Meta, StoryObj } from '@storybook/angular';
import { PendingRequestsComponent } from './pending-requests.component';

const meta: Meta<PendingRequestsComponent> = {
  title: 'Pages/Friends/PendingRequests',
  component: PendingRequestsComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<PendingRequestsComponent>;

export const Loading: Story = {};
