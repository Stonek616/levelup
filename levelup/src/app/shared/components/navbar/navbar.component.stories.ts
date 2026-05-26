import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { applicationConfig } from '@storybook/angular';
import { NavbarComponent } from './navbar.component';
import { UserService } from '../../../core/services/user.service';
import { ThemeService } from '../../../core/services/theme.service';

const mockThemeService = {
  theme: signal<'dark' | 'light'>('dark'),
  toggle: () => {},
};

const mockUserServiceLoggedIn = {
  currentUser: signal({
    id: 'user-1',
    username: 'gamer99',
    avatarUrl: null,
    email: 'gamer@example.com',
    onboardingCompleted: true,
  }),
  clearUser: () => {},
};

const mockUserServiceLoggedOut = {
  currentUser: signal(null),
  clearUser: () => {},
};

const meta: Meta<NavbarComponent> = {
  title: 'Shared/Navbar',
  component: NavbarComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<NavbarComponent>;

export const LoggedIn: Story = {
  name: 'Logged in — dark theme',
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: UserService, useValue: mockUserServiceLoggedIn },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }),
  ],
};

export const LoggedOut: Story = {
  name: 'Logged out',
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: UserService, useValue: mockUserServiceLoggedOut },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }),
  ],
};

export const LightTheme: Story = {
  name: 'Logged in — light theme',
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: UserService, useValue: mockUserServiceLoggedIn },
        { provide: ThemeService, useValue: { theme: signal<'dark' | 'light'>('light'), toggle: () => {} } },
      ],
    }),
  ],
};
