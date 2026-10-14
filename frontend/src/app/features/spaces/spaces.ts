import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import {
  DeskshareApiService,
  Space,
  SpaceFilter,
  centsToDisplay,
  spaceTypeLabel,
} from '../../core/services/deskshare-api.service';
import { SpaceFilterBarComponent } from '../../shared/components/space-filter-bar/space-filter-bar.component';

@Component({
  selector: 'app-spaces',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SpaceFilterBarComponent,
  ],
  template: `
    <!-- Page header -->
    <section class="page-header">
      <p class="eyebrow">Find a workspace</p>
      <h2>Explore flexible spaces</h2>
      <p class="page-subtitle">
        Browse hot desks, dedicated desks, private offices, and meeting rooms. Use the
        filters below to narrow your search.
      </p>
    </section>

    <!-- Filter bar -->
    <app-space-filter-bar (filterChange)="onFilterChange($event)" />

    <!-- Result count -->
    @if (!loading() && spaces().length > 0) {
      <p class="result-count" aria-live="polite">
        {{ spaces().length }} space{{ spaces().length === 1 ? '' : 's' }} found
      </p>
    }

    <!-- Loading state -->
    @if (loading()) {
      <div class="state-centered" aria-label="Loading spaces" aria-busy="true">
        <mat-spinner diameter="48" />
        <p>Loading spaces…</p>
      </div>
    }

    <!-- Empty state -->
    @if (!loading() && spaces().length === 0) {
      <div class="state-centered" role="status">
        <mat-icon class="empty-icon" aria-hidden="true">search_off</mat-icon>
        <h3>No spaces match your filters</h3>
        <p>Try adjusting the city, type, or price range above.</p>
      </div>
    }

    <!-- Space grid -->
    @if (!loading()) {
      <section class="space-grid" aria-label="Space listing">
        @for (space of spaces(); track space.id) {
          <mat-card class="space-card" [attr.aria-label]="space.name">
            <!-- Type chip banner -->
            <div class="type-banner">
              <mat-chip class="type-chip" [highlighted]="true">
                {{ typeLabel(space.type) }}
              </mat-chip>
            </div>

            <mat-card-header>
              <mat-card-title>{{ space.name }}</mat-card-title>
              <mat-card-subtitle>
                <mat-icon class="pin-icon" aria-hidden="true">location_on</mat-icon>
                {{ space.address.city }}, {{ space.address.state }}
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <!-- Description excerpt -->
              <p class="description">{{ excerpt(space.description) }}</p>

              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-label">Capacity</span>
                  <strong>{{ space.totalCapacity }} seats</strong>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Hourly</span>
                  <strong class="price">{{ displayPrice(space.priceHourly) }}</strong>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Daily</span>
                  <strong class="price">{{ displayPrice(space.priceDaily) }}</strong>
                </div>
              </div>

              <!-- Top amenities (up to 4) -->
              @if (space.amenities.length > 0) {
                <div class="amenity-row" aria-label="Amenities">
                  @for (tag of space.amenities.slice(0, 4); track tag) {
                    <span class="amenity-tag">{{ tag }}</span>
                  }
                  @if (space.amenities.length > 4) {
                    <span class="amenity-tag amenity-tag--more">
                      +{{ space.amenities.length - 4 }} more
                    </span>
                  }
                </div>
              }
            </mat-card-content>

            <mat-card-actions align="end">
              <button
                mat-flat-button
                color="primary"
                (click)="viewDetail(space.id)"
                [attr.aria-label]="'View details for ' + space.name"
              >
                View details
              </button>
            </mat-card-actions>
          </mat-card>
        }
      </section>
    }
  `,
  styles: [
    `
      :host { display: block; }

      .page-header { margin-bottom: 1.5rem; }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 0.74rem;
        font-weight: 700;
        color: #1e88e5;
        margin: 0 0 0.4rem;
      }
      h2 { margin: 0 0 0.5rem; }
      .page-subtitle { margin: 0; color: rgba(0,0,0,0.62); line-height: 1.5; max-width: 42rem; }

      .result-count {
        font-size: 0.875rem;
        color: rgba(0,0,0,0.55);
        margin: 0 0 1rem;
      }

      /* Loading / empty */
      .state-centered {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 4rem 1rem;
        text-align: center;
        color: rgba(0,0,0,0.55);
      }
      .empty-icon { font-size: 3rem; width: 3rem; height: 3rem; }

      /* Grid */
      .space-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.25rem;
      }

      .space-card {
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        transition: box-shadow 0.2s ease;
      }
      .space-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.12); }

      /* Type badge */
      .type-banner { padding: 0.75rem 1rem 0; }
      .type-chip {
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        pointer-events: none;
      }

      /* Header subtitle with pin icon */
      mat-card-subtitle {
        display: flex;
        align-items: center;
        gap: 0.15rem;
        margin-top: 0.25rem;
      }
      .pin-icon { font-size: 1rem; width: 1rem; height: 1rem; vertical-align: middle; }

      /* Description excerpt */
      .description {
        margin: 0.5rem 0 0.75rem;
        font-size: 0.875rem;
        color: rgba(0,0,0,0.65);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Meta grid */
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        background: rgba(0,0,0,0.03);
        border-radius: 10px;
        padding: 0.6rem 0.75rem;
        margin-bottom: 0.75rem;
      }
      .meta-item { display: flex; flex-direction: column; gap: 0.1rem; }
      .meta-label { font-size: 0.72rem; color: rgba(0,0,0,0.5); text-transform: uppercase; letter-spacing: 0.05em; }
      .price { color: #0d47a1; }

      /* Amenity tags */
      .amenity-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
      .amenity-tag {
        font-size: 0.72rem;
        background: rgba(30,136,229,0.1);
        color: #1565c0;
        border-radius: 100px;
        padding: 0.2rem 0.65rem;
        white-space: nowrap;
      }
      .amenity-tag--more { background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.5); }
    `,
  ],
})
export class SpacesComponent {
  protected readonly spaces = signal<Space[]>([]);
  protected readonly loading = signal(true);

  constructor(
    private readonly apiService: DeskshareApiService,
    private readonly router: Router,
  ) {
    this.load({});
  }

  protected onFilterChange(filter: SpaceFilter): void {
    this.load(filter);
  }

  protected viewDetail(id: string): void {
    this.router.navigate(['/spaces', id]);
  }

  protected typeLabel(type: Space['type']): string {
    return spaceTypeLabel(type);
  }

  protected displayPrice(cents: number): string {
    return centsToDisplay(cents);
  }

  protected excerpt(text: string, maxLen = 120): string {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text;
  }

  private load(filter: SpaceFilter): void {
    this.loading.set(true);
    this.apiService.getSpaces(filter).subscribe({
      next: (data) => {
        this.spaces.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.spaces.set([]);
        this.loading.set(false);
      },
    });
  }
}
