import type { Meta, StoryObj } from '@storybook/angular';
import { LibraryToolbarComponent } from './library-toolbar.component';

const meta: Meta<LibraryToolbarComponent> = {
  title: 'Pages/Library/LibraryToolbar',
  component: LibraryToolbarComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<LibraryToolbarComponent>;

export const Default: Story = {};
