import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { FeedItemComponent } from '../../../../shared/components/feed-item/feed-item.component';
import { FeedEvent } from '../../../../core/models/feed.model';
import { FeedService } from '../../../../core/services/feed.service';

@Component({
  selector: 'app-recent-activity',
  imports: [FeedItemComponent],
  templateUrl: './recent-activity.component.html',
  styleUrl: './recent-activity.component.scss'
})
export class RecentActivityComponent implements OnInit, OnChanges {
  @Input({ required: true }) username!: string;

  private feedService = inject(FeedService);

  events = signal<FeedEvent[]>([]);
  loading = signal(false);
  hasMore = signal(false);
  private page = 0;

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['username'] && !changes['username'].firstChange) {
      this.page = 0;
      this.events.set([]);
      this.hasMore.set(false);
      this.load();
    }
  }

  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.feedService.getUserActivity(this.username, this.page, 10).subscribe({
      next: (res) => {
        this.events.update(existing => [...existing, ...res.content]);
        this.hasMore.set(!res.last);
        this.page++;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
