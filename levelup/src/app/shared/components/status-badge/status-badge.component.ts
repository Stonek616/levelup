import { Component, Input } from '@angular/core';
import { LibraryStatus, LibraryStatusLabels } from '../../../core/models/enums';

@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  @Input() status!: LibraryStatus;

  get label(): string {
    return this.status ? LibraryStatusLabels[this.status] : '';
  }

  get cssClass(): string {
    return this.status ? `badge badge--${this.status.toLowerCase()}` : 'badge';
  }
}
