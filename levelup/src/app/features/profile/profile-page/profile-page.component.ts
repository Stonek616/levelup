import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserProfile, TasteProfile } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { TasteProfileService } from '../../../core/services/taste-profile.service';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { TasteProfileComponent } from './taste-profile/taste-profile.component';
import { RecentActivityComponent } from './recent-activity/recent-activity.component';
import { CollectionsPreviewComponent } from './collections-preview/collections-preview.component';
import { GamingAccountsComponent } from './gaming-accounts/gaming-accounts.component';

@Component({
  selector: 'app-profile-page',
  imports: [
    ProfileHeaderComponent,
    TasteProfileComponent,
    RecentActivityComponent,
    CollectionsPreviewComponent,
    GamingAccountsComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private tasteProfileService = inject(TasteProfileService);

  profile = signal<UserProfile | null>(null);
  tasteProfile = signal<TasteProfile | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  isOwnProfile = computed(() =>
    this.userService.currentUser()?.username === this.profile()?.username
  );

  canSeeFriendContent = computed(() =>
    this.isOwnProfile() || this.profile()?.isFriend === true
  );

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username')!;
      this.loading.set(true);
      this.error.set(null);

      forkJoin({
        profile: this.userService.getProfile(username),
        tasteProfile: this.tasteProfileService.getTasteProfile(username)
      }).subscribe({
        next: ({ profile, tasteProfile }) => {
          this.profile.set(profile);
          this.tasteProfile.set(tasteProfile);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load this profile.');
          this.loading.set(false);
        }
      });
    });
  }
}
