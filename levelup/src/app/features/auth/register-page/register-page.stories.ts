import type { Meta, StoryObj } from '@storybook/angular';
import { RegisterPageComponent } from './register-page.component';

const meta: Meta<RegisterPageComponent> = {
  title: 'Pages/Auth/RegisterPage',
  component: RegisterPageComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<RegisterPageComponent>;

export const Default: Story = {};
