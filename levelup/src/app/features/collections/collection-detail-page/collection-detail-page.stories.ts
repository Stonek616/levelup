import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { CollectionDetailPageComponent } from './collection-detail-page.component';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

const meta: Meta<CollectionDetailPageComponent> = {
  title: 'Pages/Collections/CollectionDetailPage',
  component: CollectionDetailPageComponent,
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
            params: of({ id: 'collection-123' }),
            paramMap: of(convertToParamMap({ id: 'collection-123' })),
            snapshot: { paramMap: convertToParamMap({ id: 'collection-123' }) },
          },
        },
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<CollectionDetailPageComponent>;

export const Loading: Story = {};
