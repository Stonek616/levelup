import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { ProfilePageComponent } from './profile-page.component';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

const meta: Meta<ProfilePageComponent> = {
  title: 'Pages/Profile/ProfilePage',
  component: ProfilePageComponent,
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
            params: of({ username: 'player1' }),
            paramMap: of(convertToParamMap({ username: 'player1' })),
            snapshot: { paramMap: convertToParamMap({ username: 'player1' }) },
          },
        },
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<ProfilePageComponent>;

export const Loading: Story = {};
