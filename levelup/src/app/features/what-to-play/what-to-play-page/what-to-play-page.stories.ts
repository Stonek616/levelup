import type { Meta, StoryObj } from '@storybook/angular';
import { WhatToPlayPageComponent } from './what-to-play-page.component';

const meta: Meta<WhatToPlayPageComponent> = {
  title: 'Pages/WhatToPlay/WhatToPlayPage',
  component: WhatToPlayPageComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<WhatToPlayPageComponent>;

export const PlatformStep: Story = {};
