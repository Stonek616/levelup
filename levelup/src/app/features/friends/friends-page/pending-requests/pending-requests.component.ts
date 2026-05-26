import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FriendRequest } from '../../../../core/models/user.model';
import { FriendService } from '../../../../core/services/friend.service';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-pending-requests',
  imports: [DatePipe, RouterLink, AvatarComponent],
  templateUrl: './pending-requests.component.html',
  styleUrl: './pending-requests.component.scss',
})
export class PendingRequestsComponent implements OnInit {
  private friendService = inject(FriendService);

  requests = signal<FriendRequest[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.friendService.getPendingRequests().subscribe({
      next: (res) => {
        this.requests.set(res.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  respond(requestId: string, action: 'ACCEPT' | 'DECLINE'): void {
    this.friendService.respondToRequest(requestId, action).subscribe({
      next: () => {
        this.requests.update((list) => list.filter((r) => r.id !== requestId));
      },
    });
  }
}
