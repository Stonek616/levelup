import type { Meta, StoryObj } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { applicationConfig } from '@storybook/angular';
import { OnboardingSearchStepComponent } from './onboarding-search-step.component';

const meta: Meta<OnboardingSearchStepComponent> = {
  title: 'Features/Onboarding/SearchStep',
  component: OnboardingSearchStepComponent,
  tags: ['autodocs'],
  decorators: [applicationConfig({ providers: [provideHttpClient()] })],
  argTypes: {
    submitting: { control: 'boolean' },
    error: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<OnboardingSearchStepComponent>;

export const Empty: Story = {
  name: 'Initial state — no games added',
  args: { submitting: false, error: null },
};

export const Submitting: Story = {
  name: 'Submitting state (loading)',
  args: { submitting: true, error: null },
};

export const WithError: Story = {
  name: 'Error state',
  args: { submitting: false, error: 'Something went wrong. Please try again.' },
};
