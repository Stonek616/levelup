import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChallengeService } from '../../../../core/services/challenge.service';
import { ChallengeHistory, ChallengeHistoryEntry } from '../../../../core/models/challenge.model';

@Component({
  selector: 'app-challenge-history',
  imports: [RouterLink],
  templateUrl: './challenge-history.component.html',
  styleUrl: './challenge-history.component.scss',
})
export class ChallengeHistoryComponent implements OnInit {
  @Input({ required: true }) isOwnProfile!: boolean;

  private readonly challengeService = inject(ChallengeService);

  history = signal<ChallengeHistory | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    if (!this.isOwnProfile) {
      this.loading.set(false);
      return;
    }
    this.challengeService.getHistory().subscribe({
      next: (h) => {
        this.history.set(h);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  scoreColor(score: number): string {
    if (score === 100) return 'perfect';
    if (score >= 75) return 'good';
    if (score >= 50) return 'ok';
    return 'low';
  }

  recentEntries(): ChallengeHistoryEntry[] {
    return this.history()?.history.content.slice(0, 7) ?? [];
  }
}
