import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrendingFeedComponent } from '../../feed/trending-feed/trending-feed.component';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, TrendingFeedComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
}
