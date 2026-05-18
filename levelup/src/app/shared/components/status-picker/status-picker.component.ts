import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor } from '@angular/common';
import { LibraryStatus, LibraryStatusLabels } from '../../../core/models/enums';
@Component({
  selector: 'app-status-picker',
  imports: [NgFor],
  templateUrl: './status-picker.component.html',
  styleUrl: './status-picker.component.scss'
})
export class StatusPickerComponent {
  @Input() status: LibraryStatus | null = null;
  @Output() statusChange = new EventEmitter<LibraryStatus>();

  readonly options = Object.values(LibraryStatus);
  readonly labels = LibraryStatusLabels;

  onSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as LibraryStatus;
    this.statusChange.emit(value);
  }
}
