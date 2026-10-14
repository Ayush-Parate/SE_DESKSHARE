import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

import {
  DeskshareApiService,
  Space,
  centsToDisplay,
  spaceTypeLabel,
} from '../../core/services/deskshare-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  template: `
    <!-- Hero banner -->
    <section class="hero-panel" aria-labelledby="hero-heading">
      <p class="eyebrow">DeskShare</p>
      <h2 id="hero-heading">Find the right workday setup.</h2>
      <p class="hero-copy">
        Search flexible desks, private offices, and meeting rooms across your preferred cities.
      </p>
      <div class="cta-row">
        <button mat-flat-button color="primary" routerLink="/spaces" aria-label="Browse all spaces">
          <mat-icon>search</mat-icon>
          Browse spaces
        </button>
        <button mat-stroked-button routerLink="/bookings" aria-label="View my bookings">
          <mat-icon>event_note</mat-icon>
          My bookings
        </button>
      </div>
    </section>

    <!-- Featured spaces -->
    @if (featuredSpaces().length > 0) {
      <section aria-labelledby="featured-heading">
        <h3 id="featured-heading" class="section-heading">Featured spaces</h3>
        <div class="feature-grid">
          @for (space of featuredSpaces(); track space.id) {
            <mat-card
              class="feature-card"
              role="article"
              [attr.aria-label]="space.name"
            >
              <div class="type-tag">{{ typeLabel(space.type) }}</div>

              <mat-card-header>
                <mat-card-title>{{ space.name }}</mat-card-title>
                <mat-card-subtitle>
                  <mat-icon class="pin-icon" aria-hidden="true">location_on</mat-icon>
                  {{ space.address.city }}, {{ space.address.state }}
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <p class="excerpt">{{ excerpt(space.description) }}</p>

                <p class="summary-row">
                  <span class="label">Capacity</span>
                  <strong>{{ space.totalCapacity }} seats</strong>
                </p>
                <p class="summary-row">
                  <span class="label">Hourly</span>
                  <strong class="price">{{ displayPrice(space.priceHourly) }}</strong>
                </p>
                <p class="summary-row">
                  <span class="label">Daily</span>
                  <strong class="price">{{ displayPrice(space.priceDaily) }}</strong>
                </p>
              </mat-card-content>

              <mat-card-actions align="end">
                <button
                  mat-stroked-button
                  color="primary"
                  (click)="goToDetail(space.id)"
                  [attr.aria-label]="'See details for ' + space.name"
                >
                  See details
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      :host { display: block; }

      /* Hero */
      .hero-panel {
        background: linear-gradient(135deg, #e3f2fd 0%, #f5f9ff 100%);
        border-radius: 20px;
        padding: 2.5rem 2rem;
        margin-bottom: 2.5rem;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 0.74rem;
        font-weight: 700;
        color: #1e88e5;
        margin: 0 0 0.75rem;
      }
      h2 {
        margin: 0 0 0.75rem;
        font-size: clamp(1.8rem, 4vw, 3rem);
      }
      .hero-copy {
        margin: 0 0 1.75rem;
        max-width: 38rem;
        color: rgba(0,0,0,0.7);
        line-height: 1.6;
      }
      .cta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }

      /* Featured section */
      .section-heading { margin: 0 0 1rem; font-size: 1.15rem; font-weight: 600; }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.25rem;
      }

      .feature-card {
        border-radius: 16px;
        transition: box-shadow 0.2s ease;
      }
      .feature-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

      .type-tag {
        margin: 0.75rem 1rem 0;
        display: inline-block;
        background: rgba(30,136,229,0.12);
        color: #1565c0;
        border-radius: 100px;
        padding: 0.2rem 0.7rem;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.04em;
      }

      mat-card-subtitle {
        display: flex;
        align-items: center;
        gap: 0.15rem;
        margin-top: 0.25rem;
      }
      .pin-icon { font-size: 1rem; width: 1rem; height: 1rem; }

      .excerpt {
        font-size: 0.85rem;
        color: rgba(0,0,0,0.6);
        line-height: 1.5;
        margin: 0.5rem 0 0.75rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0.4rem 0;
      }
      .label { color: rgba(0,0,0,0.55); font-size: 0.875rem; }
      .price { color: #0d47a1; }
    `,
  ],
})
export class HomeComponent {
  protected readonly featuredSpaces = signal<Space[]>([]);

  constructor(
    private readonly apiService: DeskshareApiService,
    private readonly router: Router,
  ) {
    this.apiService.getSpaces().subscribe((spaces) =>
      this.featuredSpaces.set(spaces.slice(0, 3)),
    );
  }

  protected goToDetail(id: string): void {
    this.router.navigate(['/spaces', id]);
  }

  protected typeLabel(type: Space['type']): string {
    return spaceTypeLabel(type);
  }

  protected displayPrice(cents: number): string {
    return centsToDisplay(cents);
  }

  protected excerpt(text: string, maxLen = 100): string {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text;
  }
}
