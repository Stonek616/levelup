import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService } from '../../../../core/services/settings.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-account-deletion',
  imports: [ReactiveFormsModule],
  templateUrl: './account-deletion.component.html',
  styleUrl: './account-deletion.component.scss',
})
export class AccountDeletionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  confirming = signal(false);
  deleting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    password: ['', Validators.required],
  });

  showConfirm() {
    this.confirming.set(true);
  }

  cancel() {
    this.confirming.set(false);
    this.form.reset();
    this.error.set(null);
  }

  deleteAccount() {
    if (this.form.invalid) return;
    this.deleting.set(true);
    this.error.set(null);
    this.settingsService.deleteAccount({ password: this.form.value.password! }).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to delete account.');
        this.deleting.set(false);
      },
    });
  }
}
