import { Component, Output, EventEmitter } from '@angular/core';
import { LibraryStatus, LibraryStatusLabels } from '../../../core/models/enums';

export interface LibraryFilters {
  status: LibraryStatus | null;
}

@Component({
  selector: 'app-library-toolbar',
  imports: [],
  templateUrl: './library-toolbar.component.html',
  styleUrl: './library-toolbar.component.scss'
})
export class LibraryToolbarComponent {
  @Output() filtersChanged = new EventEmitter<LibraryFilters>();

  readonly allStatuses = Object.values(LibraryStatus);
  readonly labels = LibraryStatusLabels;
  activeStatus: LibraryStatus | null = null;

  selectStatus(status: LibraryStatus | null): void {
    this.activeStatus = status;
    this.filtersChanged.emit({ status });
  }
}
