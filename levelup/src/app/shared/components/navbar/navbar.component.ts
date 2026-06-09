import {
  Component,
  ElementRef,
  HostListener,
  inject,
  computed,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { GameSearchInputComponent } from '../game-search-input/game-search-input.component';
import { GameSummary } from '../../../core/models/game.model';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, GameSearchInputComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly elRef = inject(ElementRef);
  readonly themeService = inject(ThemeService);

  readonly notificationService = inject(NotificationService);
  readonly currentUser = this.userService.currentUser;
  readonly isDark = computed(() => this.themeService.theme() === 'dark');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  menuOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }

  onGameSelected(game: GameSummary) {
    this.router.navigate(['/game', game.slug]);
  }

  logout() {
    this.menuOpen.set(false);
    this.authService.logout();
  }
}
