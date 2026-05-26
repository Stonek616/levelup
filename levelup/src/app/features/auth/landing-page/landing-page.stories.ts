import type { Meta, StoryObj } from '@storybook/angular';
import { LandingPageComponent } from './landing-page.component';

const meta: Meta<LandingPageComponent> = {
  title: 'Pages/Auth/LandingPage',
  component: LandingPageComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<LandingPageComponent>;

export const Default: Story = {};
