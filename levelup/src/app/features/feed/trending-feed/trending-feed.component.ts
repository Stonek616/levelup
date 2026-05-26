import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeedService } from '../../../core/services/feed.service';
import { TrendingGame } from '../../../core/models/feed.model';

@Component({
  selector: 'app-trending-feed',
  imports: [RouterLink],
  templateUrl: './trending-feed.component.html',
  styleUrl: './trending-feed.component.scss',
})
export class TrendingFeedComponent implements OnInit {
  private readonly feedService = inject(FeedService);

  games = signal<TrendingGame[]>([]);
  loading = signal(true);
  hasMore = signal(false);
  loadingMore = signal(false);

  private page = 0;

  ngOnInit(): void {
    this.loadPage();
  }

  loadMore(): void {
    if (this.loadingMore()) return;
    this.loadingMore.set(true);
    this.loadPage();
  }

  coverUrl(game: TrendingGame): string | null {
    return game.coverImageId
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverImageId}.jpg`
      : null;
  }

  private loadPage(): void {
    this.feedService.getTrending(this.page).subscribe({
      next: (res) => {
        this.games.update((list) => [...list, ...res.content]);
        this.hasMore.set(!res.last);
        this.page++;
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }
}
