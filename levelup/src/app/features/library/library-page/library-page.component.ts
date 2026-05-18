import { Component, inject, signal, OnInit } from '@angular/core';
import { LibraryService } from '../../../core/services/library.service';
import { LibraryEntry } from '../../../core/models/library-entry.model';
import { LibraryGridComponent } from '../library-grid/library-grid.component';
import { LibraryToolbarComponent, LibraryFilters } from '../library-toolbar/library-toolbar.component';

@Component({
  selector: 'app-library-page',
  imports: [LibraryGridComponent, LibraryToolbarComponent],
  templateUrl: './library-page.component.html',
  styleUrl: './library-page.component.scss'
})
export class LibraryPageComponent implements OnInit {
  private readonly libraryService = inject(LibraryService);

  entries = signal<LibraryEntry[]>([]);
  loading = signal(true);
  totalElements = signal(0);

  private currentFilters: LibraryFilters = { status: null };

  ngOnInit(): void {
    this.loadLibrary();
  }

  onFiltersChanged(filters: LibraryFilters): void {
    this.currentFilters = filters;
    this.loadLibrary();
  }

  private loadLibrary(): void {
    this.loading.set(true);
    this.libraryService.getLibrary({
      status: this.currentFilters.status ?? undefined,
      size: 100
    }).subscribe({
      next: (response) => {
        this.entries.set(response.content);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
