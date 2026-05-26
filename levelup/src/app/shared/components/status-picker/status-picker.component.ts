import { Component, Input, Output, EventEmitter, signal, HostListener, ElementRef, inject } from '@angular/core';
import { LibraryStatus, LibraryStatusLabels } from '../../../core/models/enums';

@Component({
  selector: 'app-status-picker',
  templateUrl: './status-picker.component.html',
  styleUrl: './status-picker.component.scss'
})
export class StatusPickerComponent {
  private readonly el = inject(ElementRef);

  @Input() status: LibraryStatus | null = null;
  @Output() statusChange = new EventEmitter<LibraryStatus | null>();

  readonly options = Object.values(LibraryStatus);
  readonly labels = LibraryStatusLabels;
  isOpen = signal(false);

  get currentLabel(): string {
    return this.status ? this.labels[this.status] : 'Add to library…';
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  select(option: LibraryStatus): void {
    this.statusChange.emit(option);
    this.isOpen.set(false);
  }

  selectNull(): void {
    this.statusChange.emit(null);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
