import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { OnboardingPrefsStepComponent } from './onboarding-prefs-step/onboarding-prefs-step.component';
import { OnboardingSearchStepComponent } from './onboarding-search-step/onboarding-search-step.component';

@Component({
  selector: 'app-onboarding-page',
  imports: [OnboardingPrefsStepComponent, OnboardingSearchStepComponent],
  templateUrl: './onboarding-page.component.html',
  styleUrl: './onboarding-page.component.scss',
})
export class OnboardingPageComponent {
  private readonly onboardingService = inject(OnboardingService);
  private readonly router = inject(Router);

  step = signal<1 | 2>(1);
  selectedGenres = signal<string[]>([]);
  selectedPlatforms = signal<string[]>([]);
  submitting = signal(false);
  error = signal<string | null>(null);

  onPrefsComplete(data: { genres: string[]; platforms: string[] }) {
    this.selectedGenres.set(data.genres);
    this.selectedPlatforms.set(data.platforms);
    this.step.set(2);
  }

  onSearchComplete(seededGameIds: string[]) {
    this.submitting.set(true);
    this.error.set(null);
    this.onboardingService
      .complete({
        favouriteGenres: this.selectedGenres(),
        platforms: this.selectedPlatforms(),
        seededGameIds: seededGameIds.length ? seededGameIds : undefined,
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/feed'),
        error: () => {
          this.error.set('Something went wrong. Please try again.');
          this.submitting.set(false);
        },
      });
  }

  onBack() {
    this.step.set(1);
  }
}
