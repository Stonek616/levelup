import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { LoginPageComponent } from './login-page.component';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

const meta: Meta<LoginPageComponent> = {
  title: 'Pages/Auth/LoginPage',
  component: LoginPageComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: {} },
            queryParams: of({}),
            paramMap: of(convertToParamMap({})),
          },
        },
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<LoginPageComponent>;

export const Default: Story = {};
