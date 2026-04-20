import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router)
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });
  errorMessage = '';
  isLoading = false;
  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }
    this.isLoading = true;
    const { username, email, password } = this.registerForm.value as { username: string, email: string, password: string };
    this.authService.register({ username, email, password }).subscribe({
      next: () => {
        this.router.navigate(['/onboarding']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'An error occurred during registration.';
        this.isLoading = false;
      }
    });
  }
}

