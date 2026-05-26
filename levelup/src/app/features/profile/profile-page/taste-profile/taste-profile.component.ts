import { Component, Input } from '@angular/core';
import { TasteProfile } from '../../../../core/models/user.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-taste-profile',
  imports: [DecimalPipe],
  templateUrl: './taste-profile.component.html',
  styleUrl: './taste-profile.component.scss'
})
export class TasteProfileComponent {
  @Input({ required: true }) tasteProfile!: TasteProfile;

  showDetail = false;

  get topGenres(): string {
    return this.tasteProfile.genres
      .slice(0, 3)
      .map(g => g.name)
      .join(' · ');
  }

  get compactTags(): string[] {
    return [
      ...this.tasteProfile.topTags.slice(0, 4),
      ...this.tasteProfile.topPlatforms.slice(0, 2),
    ];
  }
}
