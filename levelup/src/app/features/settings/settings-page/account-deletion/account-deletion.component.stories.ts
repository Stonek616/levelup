import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { of, throwError } from 'rxjs';
import { DangerZoneComponent } from './account-deletion.component';
import { SettingsService } from '../../../../core/services/settings.service';
import { AuthService } from '../../../../core/services/auth.service';

const mockAuthService = {
  logout: () => {},
  isAuthenticated: () => signal({}),
};

const mockSettingsServiceSuccess = {
  deleteAccount: (_req: any) =>
    of({ message: 'Account scheduled for deletion.' }),
};

const mockSettingsServiceError = {
  deleteAccount: (_req: any) =>
    throwError(() => ({ error: { message: 'Incorrect password.' } })),
};

const meta: Meta<DangerZoneComponent> = {
  title: 'Features/Settings/DangerZone',
  component: DangerZoneComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SettingsService, useValue: mockSettingsServiceSuccess },
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj<DangerZoneComponent>;

export const Initial: Story = {
  name: 'Initial state — delete button visible',
};

export const WrongPassword: Story = {
  name: 'Wrong password error',
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SettingsService, useValue: mockSettingsServiceError },
      ],
    }),
  ],
};
