import { Component, Input } from '@angular/core';
import { FriendChallengeScore } from '../../../../core/models/challenge.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-friend-scores',
  imports: [DatePipe],
  templateUrl: './friend-scores.component.html',
  styleUrl: './friend-scores.component.scss',
})
export class FriendScoresComponent {
  @Input({ required: true }) scores!: FriendChallengeScore[];
}
