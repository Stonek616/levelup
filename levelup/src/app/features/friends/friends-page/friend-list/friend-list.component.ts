import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FriendshipEntry,
  UserSummary,
} from '../../../../core/models/user.model';
import { FriendService } from '../../../../core/services/friend.service';
import { UserCardComponent } from '../../../../shared/components/user-card/user-card.component';

@Component({
  selector: 'app-friend-list',
  imports: [UserCardComponent],
  templateUrl: './friend-list.component.html',
  styleUrl: './friend-list.component.scss',
})
export class FriendListComponent implements OnInit {
  private friendService = inject(FriendService);

  friends = signal<FriendshipEntry[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.friendService.getFriends().subscribe({
      next: (res) => {
        this.friends.set(res.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toUserSummary(friend: FriendshipEntry): UserSummary {
    return {
      id: friend.id,
      username: friend.username,
      avatarUrl: friend.avatarUrl,
      isFriend: true,
      friendRequestStatus: null,
    };
  }

  onFriendRemoved(userId: string): void {
    this.friends.update((list) => list.filter((f) => f.id !== userId));
  }
}
