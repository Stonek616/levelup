import type { Meta, StoryObj } from '@storybook/angular';
import { StatusPickerComponent } from './status-picker.component';
import { LibraryStatus } from '../../../core/models/enums';

const meta: Meta<StatusPickerComponent> = {
  title: 'Shared/StatusPicker',
  component: StatusPickerComponent,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [null, ...Object.values(LibraryStatus)],
    },
  },
};
export default meta;

type Story = StoryObj<StatusPickerComponent>;

export const Unset: Story = {
  name: 'Unset — "Add to library" prompt',
  args: { status: null },
};

export const Backlog: Story = {
  args: { status: LibraryStatus.Backlog },
};

export const Playing: Story = {
  args: { status: LibraryStatus.Playing },
};

export const Completed: Story = {
  args: { status: LibraryStatus.Completed },
};

export const Abandoned: Story = {
  args: { status: LibraryStatus.Abandoned },
};
