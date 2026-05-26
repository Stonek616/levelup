import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  template: `
    <div class="skeleton" [style.width]="width" [style.height]="height" [class.skeleton--rounded]="rounded"></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-border) 50%, var(--color-surface) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 6px;

      &--rounded { border-radius: 50%; }
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class LoadingSkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() rounded = false;
}
