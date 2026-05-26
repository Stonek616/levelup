import type { Meta, StoryObj } from '@storybook/angular';
import { StatusGlyphComponent } from './status-glyph.component';
import { LibraryStatus } from '../../../core/models/enums';

const meta: Meta<StatusGlyphComponent> = {
  title: 'Shared/StatusGlyph',
  component: StatusGlyphComponent,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [null, ...Object.values(LibraryStatus)],
    },
  },
};
export default meta;

type Story = StoryObj<StatusGlyphComponent>;

export const Null: Story = {
  name: 'No status (null)',
  args: { status: null },
};

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
      <div style="display: flex; gap: 12px; align-items: center; padding: 16px;">
        <app-status-glyph [status]="null" />
        <app-status-glyph status="BACKLOG" />
        <app-status-glyph status="PLAYING" />
        <app-status-glyph status="PLAYED" />
        <app-status-glyph status="FINISHED" />
        <app-status-glyph status="COMPLETED" />
        <app-status-glyph status="ABANDONED" />
      </div>
    `,
  }),
};
