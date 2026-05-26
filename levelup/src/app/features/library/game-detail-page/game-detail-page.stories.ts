import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { GameDetailPageComponent } from './game-detail-page.component';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

const meta: Meta<GameDetailPageComponent> = {
  title: 'Pages/Library/GameDetailPage',
  component: GameDetailPageComponent,
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
            params: of({ id: 'game-123' }),
            paramMap: of(convertToParamMap({ id: 'game-123' })),
            snapshot: { paramMap: convertToParamMap({ id: 'game-123' }) },
          },
        },
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<GameDetailPageComponent>;

export const Loading: Story = {};
