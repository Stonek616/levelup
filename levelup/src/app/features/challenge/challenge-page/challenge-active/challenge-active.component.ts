import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { ChallengePayload, ChallengeRound, ChallengeRoundGame } from '../../../../core/models/challenge.model';

@Component({
  selector: 'app-challenge-active',
  templateUrl: './challenge-active.component.html',
  styleUrl: './challenge-active.component.scss',
})
export class ChallengeActiveComponent implements OnInit {
  @Input({ required: true }) payload!: ChallengePayload;
  @Output() completed = new EventEmitter<number[]>();

  currentRoundIndex = signal(0);
  answers = signal<number[]>([]);
  selectedIndex = signal<number | null>(null);
  revealed = signal(false);

  get currentRound(): ChallengeRound {
    return this.payload.rounds[this.currentRoundIndex()];
  }

  get totalRounds(): number {
    return this.payload.rounds.length;
  }

  ngOnInit(): void {
    this.answers.set([]);
  }

  selectGame(index: number): void {
    if (this.revealed()) return;
    this.selectedIndex.set(index);
  }

  confirmSelection(): void {
    const selected = this.selectedIndex();
    if (selected === null || this.revealed()) return;
    this.revealed.set(true);
  }

  nextRound(): void {
    const selected = this.selectedIndex();
    if (selected === null) return;

    this.answers.update(a => [...a, selected]);
    const nextIndex = this.currentRoundIndex() + 1;

    if (nextIndex >= this.totalRounds) {
      this.completed.emit(this.answers());
    } else {
      this.currentRoundIndex.set(nextIndex);
      this.selectedIndex.set(null);
      this.revealed.set(false);
    }
  }

  coverUrl(game: ChallengeRoundGame): string {
    return game.coverUrl ?? 'assets/images/no-cover.png';
  }
}
