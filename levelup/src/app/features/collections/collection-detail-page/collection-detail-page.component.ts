import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location, LowerCasePipe } from '@angular/common';
import { Collection } from '../../../core/models/collection.model';
import { CollectionService } from '../../../core/services/collection.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { GameSearchInputComponent } from '../../../shared/components/game-search-input/game-search-input.component';
import { GameSummary } from '../../../core/models/game.model';

@Component({
  selector: 'app-collection-detail-page',
  imports: [RouterLink, GameSearchInputComponent, LowerCasePipe],
  templateUrl: './collection-detail-page.component.html',
  styleUrl: './collection-detail-page.component.scss'
})
export class CollectionDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly collectionService = inject(CollectionService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  collection = signal<Collection | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  showAddGame = signal(false);
  showEditForm = signal(false);
  editName = signal('');
  editVisibility = signal<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('PUBLIC');
  saving = signal(false);

  isOwner = computed(() => {
    const col = this.collection();
    const user = this.userService.currentUser();
    return col !== null && user !== null && col.ownerId === user.id;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.collectionService.getCollection(id).subscribe({
      next: col => {
        this.collection.set(col);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Collection not found.');
        this.loading.set(false);
      }
    });
  }

  goBack() { this.location.back(); }

  toggleAddGame() {
    this.showAddGame.update(v => !v);
  }

  toggleEdit() {
    const col = this.collection()!;
    this.editName.set(col.name);
    this.editVisibility.set(col.visibility);
    this.showEditForm.update(v => !v);
  }

  saveEdit() {
    const col = this.collection()!;
    this.saving.set(true);
    this.collectionService.updateCollection(col.id, {
      name: this.editName(),
      visibility: this.editVisibility()
    }).subscribe({
      next: updated => {
        this.collection.set(updated);
        this.showEditForm.set(false);
        this.saving.set(false);
        this.toast.success('Collection updated');
      },
      error: () => {
        this.toast.error('Failed to update collection');
        this.saving.set(false);
      }
    });
  }

  deleteCollection() {
    if (!confirm('Delete this collection? This cannot be undone.')) return;
    this.collectionService.deleteCollection(this.collection()!.id).subscribe({
      next: () => {
        this.toast.success('Collection deleted');
        this.router.navigate(['/profile', this.collection()!.ownerUsername]);
      },
      error: () => this.toast.error('Failed to delete collection')
    });
  }

  onGameSelected(game: GameSummary) {
    const col = this.collection()!;
    this.collectionService.addGame(col.id, game.id).subscribe({
      next: updated => {
        this.collection.set(updated);
        this.showAddGame.set(false);
        this.toast.success(`${game.title} added`);
      },
      error: (err) => {
        const msg = err.status === 409 ? 'Already in this collection' : 'Failed to add game';
        this.toast.error(msg);
      }
    });
  }

  removeGame(gameId: string, title: string) {
    this.collectionService.removeGame(this.collection()!.id, gameId).subscribe({
      next: () => {
        this.collection.update(col => col
          ? { ...col, games: col.games.filter(g => g.id !== gameId) }
          : col
        );
        this.toast.success(`${title} removed`);
      },
      error: () => this.toast.error('Failed to remove game')
    });
  }

  coverUrl(coverId: string | null): string | null {
    return coverId
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverId}.jpg`
      : null;
  }
}
