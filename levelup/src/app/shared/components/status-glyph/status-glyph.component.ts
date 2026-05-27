import { Component, Input } from '@angular/core';
import { LibraryStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-status-glyph',
  imports: [],
  templateUrl: './status-glyph.component.html',
  styleUrl: './status-glyph.component.scss',
})
export class StatusGlyphComponent {
  @Input() status: LibraryStatus | null = null;

  readonly LibraryStatus = LibraryStatus;
}
