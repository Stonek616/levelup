import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { UserProfile } from '../../../../core/models/user.model';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { UserService } from '../../../../core/services/user.service';
import { FriendService } from '../../../../core/services/friend.service';

@Component({
  selector: 'app-profile-header',
  imports: [AvatarComponent],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss'
})
export class ProfileHeaderComponent implements OnInit {
  @Input({ required: true }) profile!: UserProfile;

  private userService = inject(UserService);
  private friendService = inject(FriendService);

  isFriend = signal(false);
  requestStatus = signal<string | null>(null);
  loading = signal(false);

  isOwnProfile = computed(() =>
    this.userService.currentUser()?.username === this.profile?.username
  );

  ngOnInit(): void {
    this.isFriend.set(this.profile.isFriend ?? false);
    this.requestStatus.set(this.profile.friendRequestStatus);
  }

  sendRequest(): void {
    this.loading.set(true);
    this.friendService.sendFriendRequest(this.profile.id).subscribe({
      next: (res) => {
        this.requestStatus.set(res.status);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  remove(): void {
    this.loading.set(true);
    this.friendService.removeFriend(this.profile.id).subscribe({
      next: () => {
        this.isFriend.set(false);
        this.requestStatus.set(null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
