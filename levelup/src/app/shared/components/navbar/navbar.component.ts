import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ThemeService } from '../../../core/services/theme.service';
import { GameSearchInputComponent } from '../game-search-input/game-search-input.component';
import { GameSummary } from '../../../core/models/game.model';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, GameSearchInputComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  readonly themeService = inject(ThemeService);

  readonly currentUser = this.userService.currentUser;
  readonly isDark = computed(() => this.themeService.theme() === 'dark');

  onGameSelected(game: GameSummary) {
    this.router.navigate(['/game', game.id]);
  }
}
