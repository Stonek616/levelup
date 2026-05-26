import type { Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { NotFoundPageComponent } from './not-found-page.component';

const meta: Meta<NotFoundPageComponent> = {
  title: 'Pages/NotFound',
  component: NotFoundPageComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    applicationConfig({ providers: [provideRouter([])] }),
  ],
};
export default meta;

type Story = StoryObj<NotFoundPageComponent>;

export const Default: Story = {};
