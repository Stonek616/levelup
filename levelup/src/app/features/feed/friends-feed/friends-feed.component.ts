import { Component, OnInit, inject, signal } from '@angular/core';
import { FeedService } from '../../../core/services/feed.service';
import { FeedEvent } from '../../../core/models/feed.model';
import { FeedItemComponent } from '../../../shared/components/feed-item/feed-item.component';

@Component({
  selector: 'app-friends-feed',
  imports: [FeedItemComponent],
  templateUrl: './friends-feed.component.html',
  styleUrl: './friends-feed.component.scss'
})
export class FriendsFeedComponent implements OnInit {
  private readonly feedService = inject(FeedService);

  events = signal<FeedEvent[]>([]);
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

  private loadPage(): void {
    this.feedService.getFriendsFeed(this.page).subscribe({
      next: (res) => {
        this.events.update(list => [...list, ...res.content]);
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
