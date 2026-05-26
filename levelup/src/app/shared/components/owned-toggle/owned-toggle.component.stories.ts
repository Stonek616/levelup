import type { Meta, StoryObj } from '@storybook/angular';
import { OwnedToggleComponent } from './owned-toggle.component';

const meta: Meta<OwnedToggleComponent> = {
  title: 'Shared/OwnedToggle',
  component: OwnedToggleComponent,
  tags: ['autodocs'],
  argTypes: {
    isOwned: { control: 'boolean' },
    ownedPlatforms: { control: 'object' },
    availablePlatforms: { control: 'object' },
  },
};
export default meta;

type Story = StoryObj<OwnedToggleComponent>;

export const NotOwned: Story = {
  name: 'Not owned',
  args: {
    isOwned: false,
    ownedPlatforms: [],
    availablePlatforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
  },
};

export const OwnedNoPlatform: Story = {
  name: 'Owned — no platform specified',
  args: {
    isOwned: true,
    ownedPlatforms: [],
    availablePlatforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
  },
};

export const OwnedWithPlatforms: Story = {
  name: 'Owned — PC and PlayStation',
  args: {
    isOwned: true,
    ownedPlatforms: ['PC', 'PlayStation'],
    availablePlatforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
  },
};

export const OwnedManyPlatforms: Story = {
  name: 'Owned — many platforms (overflow label)',
  args: {
    isOwned: true,
    ownedPlatforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    availablePlatforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
  },
};
