import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-rating-stars',
  imports: [NgFor, NgClass],
  templateUrl: './rating-stars.component.html',
  styleUrl: './rating-stars.component.scss'
})
export class RatingStarsComponent {
  @Input() rating: number | null = null;
  @Input() readonly = false;
  @Output() ratingChange = new EventEmitter<number>();

  hovered: number | null = null;
  readonly ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  get activeRating(): number | null {
    return this.hovered ?? this.rating;
  }
  setRating(value: number): void {
    if(!this.readonly) {
      this.ratingChange.emit(value);
    }
  }
  setHovered(value: number | null): void {
    if (!this.readonly) {
      this.hovered = value;
    }
  }
}
