import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      @if (icon) {
        <span class="empty-state__icon">{{ icon }}</span>
      }
      <p class="empty-state__title">{{ title }}</p>
      @if (message) {
        <p class="empty-state__message">{{ message }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        text-align: center;
        color: var(--color-text-secondary);
        gap: 8px;

        &__icon {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }

        &__title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }

        &__message {
          font-size: 0.875rem;
          margin: 0;
          max-width: 320px;
        }
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input() message: string | null = null;
  @Input() icon: string | null = null;
}
