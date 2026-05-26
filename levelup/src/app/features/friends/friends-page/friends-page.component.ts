import { Component } from '@angular/core';
import { FindFriendsComponent } from './find-friends/find-friends.component';
import { FriendListComponent } from './friend-list/friend-list.component';
import { PendingRequestsComponent } from './pending-requests/pending-requests.component';

@Component({
  selector: 'app-friends-page',
  imports: [
    FindFriendsComponent,
    FriendListComponent,
    PendingRequestsComponent,
  ],
  templateUrl: './friends-page.component.html',
  styleUrl: './friends-page.component.scss',
})
export class FriendsPageComponent {}
