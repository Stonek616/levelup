import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings.service';
import { UserService } from '../../../../core/services/user.service';
import { UpdateAccountSettingsRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-account-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly userService = inject(UserService);

  saving = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    username: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    email: ['', [Validators.required, Validators.email]],
    bio: [''],
    currentPassword: [''],
    newPassword: ['', Validators.minLength(8)],
  });

  ngOnInit() {
    this.userService.getMyProfile().subscribe((profile) => {
      this.form.patchValue({
        username: profile.username,
        email: profile.email ?? this.userService.currentUser()?.email ?? '',
        bio: profile.bio ?? '',
      });
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.success.set(false);
    this.error.set(null);

    const val = this.form.value;
    const request: UpdateAccountSettingsRequest = {};
    if (val.username) request.username = val.username;
    if (val.email) request.email = val.email;
    if (val.bio !== null && val.bio !== undefined) request.bio = val.bio;
    if (val.newPassword) {
      request.currentPassword = val.currentPassword ?? '';
      request.newPassword = val.newPassword;
    }

    this.settingsService.updateAccount(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
        this.form.patchValue({ currentPassword: '', newPassword: '' });
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Failed to save changes.');
      },
    });
  }
}
