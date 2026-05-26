import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings.service';
import { UserService } from '../../../../core/services/user.service';
import { VisibilityType } from '../../../../core/models/enums';

@Component({
  selector: 'app-privacy-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './privacy-settings.component.html',
  styleUrl: './privacy-settings.component.scss',
})
export class PrivacySettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly userService = inject(UserService);

  saving = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  readonly visibilityOptions: { value: VisibilityType; label: string }[] = [
    { value: VisibilityType.Public, label: 'Public' },
    { value: VisibilityType.Friends, label: 'Friends only' },
    { value: VisibilityType.Private, label: 'Private' },
  ];

  form = this.fb.group({
    libraryVisibility: [VisibilityType.Public],
    wishlistVisibility: [VisibilityType.Public],
    reviewsVisibility: [VisibilityType.Public],
  });

  ngOnInit() {
    this.userService.getMyProfile().subscribe(profile => {
      this.form.patchValue({
        libraryVisibility: profile.libraryVisibility ?? VisibilityType.Public,
        wishlistVisibility: profile.wishlistVisibility ?? VisibilityType.Public,
        reviewsVisibility: profile.reviewsVisibility ?? VisibilityType.Public,
      });
    });
  }

  save() {
    this.saving.set(true);
    this.success.set(false);
    this.error.set(null);
    this.settingsService.updatePrivacy(this.form.value as any).subscribe({
      next: () => { this.saving.set(false); this.success.set(true); },
      error: () => { this.saving.set(false); this.error.set('Failed to save privacy settings.'); },
    });
  }
}
