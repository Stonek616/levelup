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
}
