import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    @if (open) {
      <div class="overlay" (click)="onOverlayClick($event)">
        <div class="dialog" role="dialog" aria-modal="true">
          <h3 class="dialog__title">{{ title }}</h3>
          <p class="dialog__message">{{ message }}</p>
          <div class="dialog__actions">
            <button
              class="btn btn--ghost"
              (click)="cancelled.emit()"
              type="button"
            >
              {{ cancelLabel }}
            </button>
            <button
              class="btn btn--danger"
              (click)="confirmed.emit()"
              type="button"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 24px;
      }

      .dialog {
        background: var(--color-surface);
        border-radius: 12px;
        padding: 28px 24px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

        &__title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 12px;
        }

        &__message {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          margin: 0 0 24px;
        }

        &__actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Are you sure?';
  @Input() message = '';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.cancelled.emit();
    }
  }
}
