import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { GameProfile } from '../../../../core/models/user.model';
import { GamePlatformLabels } from '../../../../core/models/enums';

@Component({
  selector: 'app-gaming-accounts',
  templateUrl: './gaming-accounts.component.html',
  styleUrl: './gaming-accounts.component.scss',
})
export class GamingAccountsComponent implements OnChanges {
  @Input({ required: true }) username!: string;

  private userService = inject(UserService);

  profiles = signal<GameProfile[]>([]);
  loading = signal(true);

  ngOnChanges(): void {
    this.loading.set(true);
    this.userService.getGameProfiles(this.username).subscribe({
      next: (list) => {
        this.profiles.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  platformLabel(platform: string): string {
    return (GamePlatformLabels as Record<string, string>)[platform] ?? platform;
  }

  platformClass(platform: string): string {
    return `gaming-accounts__tag--${platform.toLowerCase()}`;
  }
}
