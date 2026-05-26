import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CollectionService } from '../../../../core/services/collection.service';
import { CollectionSummary } from '../../../../core/models/collection.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-collections-preview',
  imports: [RouterLink],
  templateUrl: './collections-preview.component.html',
  styleUrl: './collections-preview.component.scss',
})
export class CollectionsPreviewComponent implements OnInit {
  @Input({ required: true }) username!: string;
  @Input() isOwnProfile = false;

  private readonly collectionService = inject(CollectionService);
  private readonly toast = inject(ToastService);

  collections = signal<CollectionSummary[]>([]);
  loading = signal(true);
  showCreateForm = signal(false);
  newName = signal('');
  newVisibility = signal<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('PUBLIC');
  saving = signal(false);

  ngOnInit() {
    this.collectionService.getUserCollections(this.username).subscribe({
      next: (cols) => {
        this.collections.set(cols);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleCreate() {
    this.showCreateForm.update((v) => !v);
    this.newName.set('');
    this.newVisibility.set('PUBLIC');
  }

  submitCreate() {
    const name = this.newName().trim();
    if (!name) return;
    this.saving.set(true);

    this.collectionService
      .createCollection({ name, visibility: this.newVisibility() })
      .subscribe({
        next: (created) => {
          this.collections.update((cols) => [
            {
              id: created.id,
              name: created.name,
              description: created.description,
              visibility: created.visibility,
              gameCount: 0,
              previewCoverIds: [],
              createdAt: created.createdAt,
            },
            ...cols,
          ]);
          this.saving.set(false);
          this.showCreateForm.set(false);
          this.toast.success('Collection created');
        },
        error: () => {
          this.toast.error('Failed to create collection');
          this.saving.set(false);
        },
      });
  }

  coverUrl(coverId: string): string {
    return `https://images.igdb.com/igdb/image/upload/t_cover_small/${coverId}.jpg`;
  }
}
