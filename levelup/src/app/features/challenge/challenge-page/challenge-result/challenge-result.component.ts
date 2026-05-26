import { Component, Input } from '@angular/core';
import { ChallengeResult, FriendChallengeScore } from '../../../../core/models/challenge.model';
import { RouterLink } from '@angular/router';
import { FriendScoresComponent } from '../friend-scores/friend-scores.component';

@Component({
  selector: 'app-challenge-result',
  imports: [RouterLink, FriendScoresComponent],
  templateUrl: './challenge-result.component.html',
  styleUrl: './challenge-result.component.scss',
})
export class ChallengeResultComponent {
  @Input({ required: true }) result!: ChallengeResult;
  @Input() friendScores: FriendChallengeScore[] = [];

  copied = false;

  get scoreLabel(): string {
    if (this.result.score === 100) return 'Perfect!';
    if (this.result.score >= 75) return 'Great job!';
    if (this.result.score >= 50) return 'Good effort!';
    return 'Better luck tomorrow!';
  }

  copyShareText(): void {
    navigator.clipboard.writeText(this.result.shareText).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
