import { Component, signal } from '@angular/core';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { PrivacySettingsComponent } from './privacy-settings/privacy-settings.component';
import { GameProfilesComponent } from './game-profiles/game-profiles.component';
import {AccountDeletionComponent } from './account-deletion/account-deletion.component';

type SettingsTab = 'account' | 'privacy' | 'gaming' | 'danger';

@Component({
  selector: 'app-settings-page',
  imports: [AccountSettingsComponent, PrivacySettingsComponent, GameProfilesComponent, AccountDeletionComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
})
export class SettingsPageComponent {
  activeTab = signal<SettingsTab>('account');

  tabs: { id: SettingsTab; label: string }[] = [
    { id: 'account', label: 'Account' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'gaming', label: 'Gaming Profiles' },
    { id: 'danger', label: 'Account Deletion' },
  ];
}
