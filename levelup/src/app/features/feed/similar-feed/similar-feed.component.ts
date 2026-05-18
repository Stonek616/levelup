import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeedService } from '../../../core/services/feed.service';
import { DiscoveryGame } from '../../../core/models/feed.model';

@Component({
  selector: 'app-similar-feed',
  imports: [RouterLink],
  templateUrl: './similar-feed.component.html',
  styleUrl: './similar-feed.component.scss'
})
export class SimilarFeedComponent implements OnInit {
  private readonly feedService = inject(FeedService);

  games = signal<DiscoveryGame[]>([]);
  loading = signal(true);
  hasMore = signal(false);
  loadingMore = signal(false);
  private page = 0;

  ngOnInit(): void { this.loadPage(); }

  loadMore(): void {
    if (this.loadingMore()) return;
    this.loadingMore.set(true);
    this.loadPage();
  }

  coverUrl(game: DiscoveryGame): string | null {
    return game.coverImageId
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverImageId}.jpg`
      : null;
  }

  private loadPage(): void {
    this.feedService.getSimilar(this.page).subscribe({
      next: (res) => {
        this.games.update(list => [...list, ...res.content]);
        this.hasMore.set(!res.last);
        this.page++;
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      }
    });
  }
}
