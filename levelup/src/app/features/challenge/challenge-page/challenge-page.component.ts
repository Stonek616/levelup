import { Component, OnInit, inject, signal } from '@angular/core';
import { ChallengeService } from '../../../core/services/challenge.service';
import {
  ChallengePayload,
  ChallengeResponse,
  ChallengeResult,
  CompletedChallenge,
  DailyChallenge,
  FriendChallengeScore,
} from '../../../core/models/challenge.model';
import { ChallengeActiveComponent } from './challenge-active/challenge-active.component';
import { ChallengeResultComponent } from './challenge-result/challenge-result.component';

type PageState = 'loading' | 'active' | 'submitting' | 'result' | 'already-done' | 'no-challenge' | 'error';

@Component({
  selector: 'app-challenge-page',
  imports: [ChallengeActiveComponent, ChallengeResultComponent],
  templateUrl: './challenge-page.component.html',
  styleUrl: './challenge-page.component.scss',
})
export class ChallengePageComponent implements OnInit {
  private readonly challengeService = inject(ChallengeService);

  state = signal<PageState>('loading');
  payload = signal<ChallengePayload | null>(null);
  result = signal<ChallengeResult | null>(null);
  friendScores = signal<FriendChallengeScore[]>([]);
  friendCompletedCount = signal(0);

  ngOnInit(): void {
    this.challengeService.getToday().subscribe({
      next: (response: ChallengeResponse) => {
        if (response.completed) {
          const done = response as CompletedChallenge;
          this.result.set(done.result);
          this.friendScores.set(done.friendScores ?? []);
          this.state.set('already-done');
        } else {
          const active = response as DailyChallenge;
          this.payload.set(active.payload);
          this.friendCompletedCount.set(active.friendCompletedCount);
          this.state.set('active');
        }
      },
      error: (err) => {
        if (err.status === 404) {
          this.state.set('no-challenge');
        } else {
          this.state.set('error');
        }
      },
    });
  }

  onRoundsCompleted(roundAnswers: number[]): void {
    this.state.set('submitting');
    this.challengeService.submit({ answer: { roundAnswers } }).subscribe({
      next: (result) => {
        this.result.set(result);
        this.friendScores.set(result.friendScores ?? []);
        this.state.set('result');
      },
      error: () => this.state.set('error'),
    });
  }
}
