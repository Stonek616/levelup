import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { ReviewDetailPageComponent } from './review-detail-page.component';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

const meta: Meta<ReviewDetailPageComponent> = {
  title: 'Pages/Review/ReviewDetailPage',
  component: ReviewDetailPageComponent,
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
            params: of({ id: 'review-123' }),
            paramMap: of(convertToParamMap({ id: 'review-123' })),
            snapshot: { paramMap: convertToParamMap({ id: 'review-123' }) },
          },
        },
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<ReviewDetailPageComponent>;

export const Loading: Story = {};
