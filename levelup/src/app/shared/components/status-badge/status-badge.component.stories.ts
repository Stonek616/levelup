import type { Meta, StoryObj } from '@storybook/angular';
import { StatusBadgeComponent } from './status-badge.component';
import { LibraryStatus } from '../../../core/models/enums';

const meta: Meta<StatusBadgeComponent> = {
  title: 'Shared/StatusBadge',
  component: StatusBadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: Object.values(LibraryStatus),
    },
  },
};
export default meta;

type Story = StoryObj<StatusBadgeComponent>;

export const Backlog: Story = { args: { status: LibraryStatus.Backlog } };
export const Playing: Story = { args: { status: LibraryStatus.Playing } };
export const Played: Story = { args: { status: LibraryStatus.Played } };
export const Finished: Story = { args: { status: LibraryStatus.Finished } };
export const Completed: Story = { args: { status: LibraryStatus.Completed } };
export const Abandoned: Story = { args: { status: LibraryStatus.Abandoned } };

export const AllStatuses: Story = {
  name: 'All statuses side by side',
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; padding: 16px;">
        <app-status-badge status="BACKLOG" />
        <app-status-badge status="PLAYING" />
        <app-status-badge status="PLAYED" />
        <app-status-badge status="FINISHED" />
        <app-status-badge status="COMPLETED" />
        <app-status-badge status="ABANDONED" />
      </div>
    `,
  }),
};
