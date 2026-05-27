import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LibraryService } from '../../../core/services/library.service';
import { LibraryEntry } from '../../../core/models/library-entry.model';
import { PLATFORM_LABELS } from '../../../core/utils/platform-labels';
import { LibraryGridComponent } from '../../library/library-grid/library-grid.component';
import {
  LibraryToolbarComponent,
  LibraryFilters,
} from '../../library/library-toolbar/library-toolbar.component';

@Component({
  selector: 'app-user-library-page',
  imports: [LibraryGridComponent, LibraryToolbarComponent],
  templateUrl: './user-library-page.component.html',
  styleUrl: './user-library-page.component.scss',
})
export class UserLibraryPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private libraryService = inject(LibraryService);

  username = signal('');
  entries = signal<LibraryEntry[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  totalElements = signal(0);

  availablePlatforms = computed(() => {
    const seen = new Set<string>();
    this.entries().forEach((e) => e.platforms.forEach((p) => seen.add(p)));
    return [...seen].sort((a, b) =>
      (PLATFORM_LABELS[a] ?? a).localeCompare(PLATFORM_LABELS[b] ?? b),
    );
  });

  private currentFilters: LibraryFilters = {
    status: null,
    platform: null,
    ownership: null,
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.username.set(params.get('username')!);
      this.loadLibrary();
    });
  }

  onFiltersChanged(filters: LibraryFilters): void {
    this.currentFilters = filters;
    this.loadLibrary();
  }

  goBack(): void {
    this.router.navigate(['/profile', this.username()]);
  }

  private loadLibrary(): void {
    this.loading.set(true);
    this.error.set(null);
    this.libraryService
      .getUserLibrary(this.username(), {
        status: this.currentFilters.status ?? undefined,
        platform: this.currentFilters.platform ?? undefined,
        ownership: this.currentFilters.ownership ?? undefined,
        size: 100,
      })
      .subscribe({
        next: (response) => {
          this.entries.set(response.content);
          this.totalElements.set(response.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load this library.');
          this.loading.set(false);
        },
      });
  }
}
