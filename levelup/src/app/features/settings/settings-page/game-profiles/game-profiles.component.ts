import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings.service';
import { GameProfile } from '../../../../core/models/user.model';
import { GamePlatform, GamePlatformLabels } from '../../../../core/models/enums';

@Component({
  selector: 'app-game-profiles',
  imports: [ReactiveFormsModule],
  templateUrl: './game-profiles.component.html',
  styleUrl: './game-profiles.component.scss',
})
export class GameProfilesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);

  profiles = signal<GameProfile[]>([]);
  adding = signal(false);
  error = signal<string | null>(null);

  readonly platforms = Object.values(GamePlatform);
  readonly platformLabels = GamePlatformLabels;

  form = this.fb.group({
    platform: [GamePlatform.PSN, Validators.required],
    handle: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit() {
    this.load();
  }

  private load() {
    this.settingsService.getGameProfiles().subscribe(profiles => this.profiles.set(profiles));
  }

  add() {
    if (this.form.invalid) return;
    this.adding.set(true);
    this.error.set(null);
    this.settingsService.addGameProfile(this.form.value as any).subscribe({
      next: profile => {
        this.profiles.update(list => [...list, profile]);
        this.form.reset({ platform: GamePlatform.PSN, handle: '' });
        this.adding.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to add profile.');
        this.adding.set(false);
      },
    });
  }

  remove(profileId: string) {
    this.settingsService.removeGameProfile(profileId).subscribe({
      next: () => this.profiles.update(list => list.filter(p => p.id !== profileId)),
    });
  }

  platformLabel(platform: string): string {
    return (this.platformLabels as any)[platform] ?? platform;
  }
}
