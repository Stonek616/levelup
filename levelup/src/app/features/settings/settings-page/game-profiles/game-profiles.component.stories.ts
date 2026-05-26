import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { of } from 'rxjs';
import { GameProfilesComponent } from './game-profiles.component';
import { SettingsService } from '../../../../core/services/settings.service';

const mockProfiles = [
  { id: 'prof-1', platform: 'PSN', handle: 'gamer99_psn' },
  { id: 'prof-2', platform: 'STEAM', handle: 'gamer99_steam' },
];

const mockSettingsServiceWithProfiles = {
  getGameProfiles: () => of(mockProfiles),
  addGameProfile: (_req: any) => of({ id: 'prof-3', platform: 'XBOX', handle: 'newhandle' }),
  removeGameProfile: (_id: string) => of(void 0),
};

const mockSettingsServiceEmpty = {
  getGameProfiles: () => of([]),
  addGameProfile: (_req: any) => of({ id: 'prof-1', platform: 'PSN', handle: 'newhandle' }),
  removeGameProfile: (_id: string) => of(void 0),
};

const meta: Meta<GameProfilesComponent> = {
  title: 'Features/Settings/GameProfiles',
  component: GameProfilesComponent,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<GameProfilesComponent>;

export const WithProfiles: Story = {
  name: 'Two linked profiles',
  decorators: [
    applicationConfig({
      providers: [{ provide: SettingsService, useValue: mockSettingsServiceWithProfiles }],
    }),
  ],
};

export const Empty: Story = {
  name: 'No profiles linked yet',
  decorators: [
    applicationConfig({
      providers: [{ provide: SettingsService, useValue: mockSettingsServiceEmpty }],
    }),
  ],
};
