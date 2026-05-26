import type { Meta, StoryObj } from '@storybook/angular';
import { LibraryPageComponent } from './library-page.component';

const meta: Meta<LibraryPageComponent> = {
  title: 'Pages/Library/LibraryPage',
  component: LibraryPageComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<LibraryPageComponent>;

export const Loading: Story = {};
