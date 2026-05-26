import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AvatarComponent } from '../avatar/avatar.component';
import { FeedEvent } from '../../../core/models/feed.model';

@Component({
  selector: 'app-feed-item',
  imports: [RouterLink, DatePipe, AvatarComponent],
  templateUrl: './feed-item.component.html',
  styleUrl: './feed-item.component.scss'
})
export class FeedItemComponent {
  @Input({ required: true }) event!: FeedEvent;

  get coverUrl(): string | null {
    const id = this.event.game.coverImageId;
    return id ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${id}.jpg` : null;
  }

  get description(): string {
    const meta = this.parsedMetadata;
    switch (this.event.type) {
      case 'STATUS_CHANGE':
        return `changed ${this.formatStatus(meta['oldStatus'])} → ${this.formatStatus(meta['newStatus'])}`;
      case 'RATING_ADDED':
        return `rated ${meta['rating']}/10`;
      case 'GAME_ADDED':
        return `added to library · ${this.formatStatus(meta['status'])}`;
      case 'REVIEW_POSTED':
        return 'posted a review';
      case 'COMMENT_POSTED':
        return 'commented on a review';
      case 'COLLECTION_CREATED':
        return 'created a collection';
      default:
        return 'updated their library';
    }
  }

  private get parsedMetadata(): Record<string, any> {
    try { return JSON.parse(this.event.metadata ?? '{}'); }
    catch { return {}; }
  }

  private formatStatus(status: string): string {
    if (!status) return '';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}
