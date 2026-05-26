import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { LibraryService } from '../../../core/services/library.service';
import { LibraryEntry } from '../../../core/models/library-entry.model';
import { PLATFORM_LABELS } from '../../../core/utils/platform-labels';
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

  availablePlatforms = computed(() => {
    const seen = new Set<string>();
    this.entries().forEach(e => e.platforms.forEach(p => seen.add(p)));
    return [...seen].sort((a, b) =>
      (PLATFORM_LABELS[a] ?? a).localeCompare(PLATFORM_LABELS[b] ?? b)
    );
  });

  private currentFilters: LibraryFilters = { status: null, platform: null, ownership: null };

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
      platform: this.currentFilters.platform ?? undefined,
      ownership: this.currentFilters.ownership ?? undefined,
      size: 100,
    }).subscribe({
      next: (response) => {
        this.entries.set(response.content);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
