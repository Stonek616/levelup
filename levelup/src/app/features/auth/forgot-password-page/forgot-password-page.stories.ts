import type { Meta, StoryObj } from '@storybook/angular';
import { ForgotPasswordPageComponent } from './forgot-password-page.component';

const meta: Meta<ForgotPasswordPageComponent> = {
  title: 'Pages/Auth/ForgotPasswordPage',
  component: ForgotPasswordPageComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<ForgotPasswordPageComponent>;

export const Default: Story = {};
