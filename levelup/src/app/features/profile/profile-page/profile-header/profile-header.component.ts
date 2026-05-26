import {
  Component,
  Input,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserProfile } from '../../../../core/models/user.model';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ReportModalComponent } from '../../../../shared/components/report-modal/report-modal.component';
import { UserService } from '../../../../core/services/user.service';
import { FriendService } from '../../../../core/services/friend.service';
import { VisibilityType } from '../../../../core/models/enums';

@Component({
  selector: 'app-profile-header',
  imports: [
    AvatarComponent,
    RouterLink,
    ConfirmDialogComponent,
    ReportModalComponent,
  ],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss',
})
export class ProfileHeaderComponent implements OnInit {
  @Input({ required: true }) profile!: UserProfile;

  private userService = inject(UserService);
  private friendService = inject(FriendService);

  isFriend = signal(false);
  requestStatus = signal<string | null>(null);
  loading = signal(false);
  showRemoveFriendConfirm = signal(false);
  showReportModal = signal(false);

  avatarUrl = signal<string | null>(null);
  uploading = signal(false);
  uploadError = signal<string | null>(null);

  isOwnProfile = computed(
    () => this.userService.currentUser()?.username === this.profile?.username,
  );

  canSeeLibrary = computed(() => {
    if (this.isOwnProfile()) return true;
    const vis = this.profile?.libraryVisibility;
    if (!vis || vis === VisibilityType.Public) return true;
    if (vis === VisibilityType.Friends) return this.isFriend();
    return false;
  });

  libraryLink = computed((): string[] => {
    if (this.isOwnProfile()) return ['/library'];
    return ['/profile', this.profile.username, 'library'];
  });

  ngOnInit(): void {
    this.isFriend.set(this.profile.isFriend ?? false);
    this.requestStatus.set(this.profile.friendRequestStatus);
    this.avatarUrl.set(this.profile.avatarUrl);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    input.value = '';

    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('Image must be under 5 MB');
      return;
    }

    this.uploading.set(true);
    this.uploadError.set(null);

    this.userService.uploadAvatar(file).subscribe({
      next: (updated) => {
        this.avatarUrl.set(updated.avatarUrl);
        const current = this.userService.currentUser();
        if (current)
          this.userService.setUser({
            ...current,
            avatarUrl: updated.avatarUrl,
          });
        this.uploading.set(false);
      },
      error: () => {
        this.uploadError.set('Upload failed — try again');
        this.uploading.set(false);
      },
    });
  }

  removeAvatar(): void {
    this.uploading.set(true);
    this.uploadError.set(null);
    this.userService.deleteAvatar().subscribe({
      next: () => {
        this.avatarUrl.set(null);
        const current = this.userService.currentUser();
        if (current) this.userService.setUser({ ...current, avatarUrl: null });
        this.uploading.set(false);
      },
      error: () => {
        this.uploadError.set('Remove failed — try again');
        this.uploading.set(false);
      },
    });
  }

  sendRequest(): void {
    this.loading.set(true);
    this.friendService.sendFriendRequest(this.profile.id).subscribe({
      next: (res) => {
        this.requestStatus.set(res.status);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
      error: () => this.loading.set(false),
    });
  }
}
