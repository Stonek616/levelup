import { Component, signal } from '@angular/core';
import { FriendsFeedComponent } from '../friends-feed/friends-feed.component';
import { TrendingFeedComponent } from '../trending-feed/trending-feed.component';
import { ForYouFeedComponent } from '../for-you-feed/for-you-feed.component';
import { SimilarFeedComponent } from '../similar-feed/similar-feed.component';
import { NewNotableFeedComponent } from '../new-notable-feed/new-notable-feed.component';

type FeedTab = 'friends' | 'trending' | 'for-you' | 'similar' | 'new-notable';

@Component({
  selector: 'app-feed-page',
  imports: [
    FriendsFeedComponent,
    TrendingFeedComponent,
    ForYouFeedComponent,
    SimilarFeedComponent,
    NewNotableFeedComponent,
  ],
  templateUrl: './feed-page.component.html',
  styleUrl: './feed-page.component.scss',
})
export class FeedPageComponent {
  activeTab = signal<FeedTab>('friends');

  setTab(tab: FeedTab): void {
    this.activeTab.set(tab);
  }
}
