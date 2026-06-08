import {
  Component,
  Output,
  EventEmitter,
  signal,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, switchMap, tap } from 'rxjs';
import { GameService } from '../../../core/services/game.service';
import { GameSummary } from '../../../core/models/game.model';

@Component({
  selector: 'app-game-search-input',
  imports: [],
  templateUrl: './game-search-input.component.html',
  styleUrl: './game-search-input.component.scss',
})
export class GameSearchInputComponent implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  results = signal<GameSummary[]>([]);
  loading = signal(false);
  query = signal('');

  @Output() gameSelected = new EventEmitter<GameSummary>();

  ngOnInit() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        tap(() => this.loading.set(true)),
        switchMap((query) =>
          this.gameService.searchGames(query).pipe(catchError(() => of([]))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (results) => {
          this.results.set(results);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    if (value.trim().length === 0) {
      this.results.set([]);
      return;
    }
    this.searchSubject.next(value);
  }

  coverUrl(game: GameSummary): string | null {
    if (!game.coverImageId) return null;
    return `https://images.igdb.com/igdb/image/upload/t_thumb/${game.coverImageId}.jpg`;
  }

  selectGame(game: GameSummary) {
    this.gameSelected.emit(game);
    this.results.set([]);
    this.query.set('');
  }
}
