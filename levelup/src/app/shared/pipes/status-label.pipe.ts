import { Pipe, PipeTransform } from '@angular/core';
import { LibraryStatus, LibraryStatusLabels } from '../../core/models/enums';

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return LibraryStatusLabels[value as LibraryStatus] ?? value;
  }
}
