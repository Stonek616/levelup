import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerForm = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordsMatch },
  );

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = '';
  isLoading = false;

  get passwordMismatch(): boolean {
    const confirm = this.registerForm.get('confirmPassword');
    return (
      !!confirm?.touched && !!this.registerForm.errors?.['passwordMismatch']
    );
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }
  toggleConfirmPassword() {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    const { username, email, password } = this.registerForm.value as {
      username: string;
      email: string;
      password: string;
    };
    this.authService.register({ username, email, password }).subscribe({
      next: () => this.router.navigate(['/onboarding']),
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'An error occurred during registration.';
        this.isLoading = false;
      },
    });
  }
}
