import type { Meta, StoryObj } from '@storybook/angular';
import { OnboardingPrefsStepComponent } from './onboarding-prefs-step.component';

const meta: Meta<OnboardingPrefsStepComponent> = {
  title: 'Features/Onboarding/PrefsStep',
  component: OnboardingPrefsStepComponent,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<OnboardingPrefsStepComponent>;

export const Empty: Story = {
  name: 'Initial state — nothing selected',
};

export const GenresOnly: Story = {
  name: 'Genres selected, no platform yet (cannot continue)',
  render: () => ({
    template: `<app-onboarding-prefs-step />`,
  }),
};
