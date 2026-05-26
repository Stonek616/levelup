import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserSearchResult } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { UserCardComponent } from '../../../../shared/components/user-card/user-card.component';

@Component({
  selector: 'app-find-friends',
  imports: [ReactiveFormsModule, UserCardComponent],
  templateUrl: './find-friends.component.html',
  styleUrl: './find-friends.component.scss',
})
export class FindFriendsComponent {
  private userService = inject(UserService);

  searchControl = new FormControl('');
  results = signal<UserSearchResult[]>([]);
  loading = signal(false);
  searched = signal(false);

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((query) => {
          const q = query?.trim() ?? '';
          if (!q) {
            this.results.set([]);
            this.searched.set(false);
            return EMPTY;
          }
          this.loading.set(true);
          return this.userService.searchUsers(q);
        }),
      )
      .subscribe({
        next: (res) => {
          this.results.set(res.content);
          this.loading.set(false);
          this.searched.set(true);
        },
        error: () => this.loading.set(false),
      });
  }
}
