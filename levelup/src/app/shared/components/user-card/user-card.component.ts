import { Component, Input, OnInit, Output, EventEmitter, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { UserSummary } from '../../../core/models/user.model';
import { FriendService } from '../../../core/services/friend.service';

@Component({
  selector: 'app-user-card',
  imports: [RouterLink, AvatarComponent, ConfirmDialogComponent],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent implements OnInit {
  @Input({ required: true }) user!: UserSummary;
  @Output() friendRemoved = new EventEmitter<string>();

  private friendService = inject(FriendService);

  isFriend = signal(false);
  requestStatus = signal<string | null>(null);
  loading = signal(false);
  showRemoveConfirm = signal(false);

  ngOnInit(): void {
    this.isFriend.set(this.user.isFriend ?? false);
    this.requestStatus.set(this.user.friendRequestStatus ?? null);
  }

  sendRequest(): void {
    this.loading.set(true);
    this.friendService.sendFriendRequest(this.user.id).subscribe({
      next: (res) => {
        this.requestStatus.set(res.status);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  remove(): void {
    this.loading.set(true);
    this.friendService.removeFriend(this.user.id).subscribe({
      next: () => {
        this.friendRemoved.emit(this.user.id);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
