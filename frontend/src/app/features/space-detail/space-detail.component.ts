import { Component, OnInit, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  DeskshareApiService,
  Space,
  SpaceReviewsSummary,
  centsToDisplay,
  spaceTypeLabel,
} from '../../core/services/deskshare-api.service';
import { ReviewListComponent } from '../reviews/review-list/review-list.component';
import { ReviewFormComponent } from '../reviews/review-form/review-form.component';
import { SessionService } from '../../core/services/session.service';

// Lazy-loaded components for @defer block (kept in imports for template type-checking)
import type { ReviewListComponent as ReviewListType } from '../reviews/review-list/review-list.component';
import type { ReviewFormComponent as ReviewFormType } from '../reviews/review-form/review-form.component';

@Component({
  selector: 'app-space-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReviewListComponent,
    ReviewFormComponent,
  ],
  template: `
    <!-- Back nav -->
    <nav class="back-nav" aria-label="Breadcrumb">
      <a mat-button routerLink="/spaces" aria-label="Back to all spaces">
        <mat-icon>arrow_back</mat-icon>
        All spaces
      </a>
    </nav>

    <!-- Loading -->
    @if (loading()) {
      <div class="state-centered" aria-label="Loading space details" aria-busy="true">
        <mat-spinner diameter="52" />
        <p>Loading space details…</p>
      </div>
    }

    <!-- Error -->
    @if (!loading() && !space()) {
      <div class="state-centered" role="alert">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>Space not found</h3>
        <p>The space you're looking for doesn't exist or has been removed.</p>
        <a mat-flat-button color="primary" routerLink="/spaces">Browse all spaces</a>
      </div>
    }

    <!-- Detail layout -->
    @if (!loading() && space(); as sp) {
      <article class="detail-layout" [attr.aria-label]="sp.name + ' details'">

        <!-- Hero section -->
        <header class="hero">
          <div class="hero-text">
            <div class="type-chip-wrap">
              <mat-chip class="type-chip" [highlighted]="true">
                {{ typeLabel(sp.type) }}
              </mat-chip>
              @if (!sp.active) {
                <mat-chip class="inactive-chip">Inactive</mat-chip>
              }
            </div>
            <h2>{{ sp.name }}</h2>
            <p class="location">
              <mat-icon class="pin-icon" aria-hidden="true">location_on</mat-icon>
              {{ sp.address.street }}, {{ sp.address.city }}, {{ sp.address.state }}
              {{ sp.address.postalCode }}, {{ sp.address.country }}
            </p>
          </div>

          <!-- Sticky pricing / CTA card -->
          <aside class="pricing-card" aria-label="Pricing and booking">
            <div class="price-block">
              <span class="price-amount">{{ displayPrice(sp.priceHourly) }}</span>
              <span class="price-unit">/ hour</span>
            </div>
            <div class="price-block price-block--secondary">
              <span class="price-amount price-amount--secondary">{{ displayPrice(sp.priceDaily) }}</span>
              <span class="price-unit">/ day</span>
            </div>

            <mat-divider class="price-divider" />

            <div class="capacity-row">
              <mat-icon aria-hidden="true">group</mat-icon>
              <span>Capacity: <strong>{{ sp.totalCapacity }} seats</strong></span>
            </div>

            <button
              mat-flat-button
              color="primary"
              class="book-btn"
              aria-label="Book this space"
              (click)="bookNow()"
            >
              <mat-icon>event_available</mat-icon>
              Book Now
            </button>

            <p class="book-note">No account needed — book as a guest</p>
          </aside>
        </header>

        <mat-divider class="section-divider" />

        <!-- Description -->
        <section class="section" aria-labelledby="desc-heading">
          <h3 id="desc-heading">About this space</h3>
          <p class="description">{{ sp.description }}</p>
        </section>

        <mat-divider class="section-divider" />

        <!-- Amenities -->
        @if (sp.amenities.length > 0) {
          <section class="section" aria-labelledby="amenities-heading">
            <h3 id="amenities-heading">
              <mat-icon aria-hidden="true">check_circle_outline</mat-icon>
              Amenities
            </h3>
            <div class="amenity-grid" role="list">
              @for (tag of sp.amenities; track tag) {
                <div class="amenity-item" role="listitem">
                  <mat-icon class="amenity-icon" aria-hidden="true">check</mat-icon>
                  {{ tag }}
                </div>
              }
            </div>
          </section>

          <mat-divider class="section-divider" />
        }

        <!-- Address & coordinates -->
        <section class="section" aria-labelledby="location-heading">
          <h3 id="location-heading">
            <mat-icon aria-hidden="true">place</mat-icon>
            Location
          </h3>
          <address class="address-block">
            <p>{{ sp.address.street }}</p>
            <p>{{ sp.address.city }}, {{ sp.address.state }} {{ sp.address.postalCode }}</p>
            <p>{{ sp.address.country }}</p>
          </address>
          @if (sp.latitude && sp.longitude) {
            <p class="coords" aria-label="Coordinates">
              <mat-icon aria-hidden="true">my_location</mat-icon>
              {{ sp.latitude.toFixed(4) }}, {{ sp.longitude.toFixed(4) }}
            </p>
          }
        </section>

        <mat-divider class="section-divider" />

        <!-- Reviews section -->
        <section class="section reviews-section" aria-labelledby="reviews-heading">
          <h3 id="reviews-heading">
            <mat-icon aria-hidden="true">rate_review</mat-icon>
            Reviews
          </h3>

          @if (reviewsLoading()) {
            <div class="reviews-loading" aria-label="Loading reviews">
              <mat-spinner diameter="32" />
              <p>Loading reviews…</p>
            </div>
          } @else {
            @defer (on viewport) {
              <!-- Review form (show first for authenticated users) -->
              <app-review-form
                [spaceId]="sp.id"
                [hasExistingReview]="hasUserReviewed()"
                (reviewSubmitted)="loadReviews(sp.id)"
                (loginRequired)="onLoginRequired()"
              />

              <!-- Review list -->
              <app-review-list
                [summary]="reviewsSummary()"
                [submitting]="reviewFormSubmitting()"
              />
            } @placeholder {
              <div class="reviews-placeholder">Loading reviews…</div>
            } @loading {
              <div class="reviews-loading" aria-label="Loading reviews">
                <mat-spinner diameter="32" />
                <p>Loading reviews…</p>
              </div>
            }
          }
        </section>

        <mat-divider class="section-divider" />

        <!-- Meta row -->
        <section class="section meta-footer" aria-label="Space metadata">
          <div class="meta-item">
            <mat-icon aria-hidden="true">fingerprint</mat-icon>
            <span class="meta-label">Space ID</span>
            <code>{{ sp.id }}</code>
          </div>
          <div class="meta-item">
            <mat-icon aria-hidden="true">person_outline</mat-icon>
            <span class="meta-label">Owner ID</span>
            <code>{{ sp.ownerId }}</code>
          </div>
          @if (sp.createdAt) {
            <div class="meta-item">
              <mat-icon aria-hidden="true">schedule</mat-icon>
              <span class="meta-label">Listed</span>
              <time [attr.datetime]="sp.createdAt">{{ formatDate(sp.createdAt) }}</time>
            </div>
          }
        </section>

      </article>
    }
  `,
  styles: [
    `
      :host { display: block; }

      /* Back nav */
      .back-nav { margin-bottom: 1.25rem; }
      .back-nav a {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        color: rgba(0,0,0,0.6);
      }

      /* Loading / error */
      .state-centered {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 5rem 1rem;
        text-align: center;
        color: rgba(0,0,0,0.55);
      }
      .error-icon { font-size: 3rem; width: 3rem; height: 3rem; color: #d32f2f; }

      /* Detail layout */
      .detail-layout { max-width: 900px; }

      /* Hero */
      .hero {
        display: flex;
        gap: 2rem;
        align-items: flex-start;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
      }
      .hero-text { flex: 1 1 320px; }

      .type-chip-wrap { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
      .type-chip { font-size: 0.76rem; font-weight: 600; pointer-events: none; }
      .inactive-chip { background: #ffebee; color: #c62828; pointer-events: none; }

      h2 { margin: 0 0 0.5rem; font-size: clamp(1.6rem, 3vw, 2.4rem); }

      .location {
        display: flex;
        align-items: center;
        gap: 0.2rem;
        color: rgba(0,0,0,0.62);
        margin: 0;
        font-size: 0.95rem;
      }
      .pin-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

      /* Pricing card */
      .pricing-card {
        flex: 0 0 220px;
        background: var(--mat-sys-surface-container-low, #f5f8ff);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .price-block { display: flex; align-items: baseline; gap: 0.35rem; }
      .price-amount { font-size: 1.75rem; font-weight: 700; color: #0d47a1; }
      .price-block--secondary { margin-top: -0.5rem; }
      .price-amount--secondary { font-size: 1.25rem; color: #1565c0; }
      .price-unit { color: rgba(0,0,0,0.55); font-size: 0.875rem; }
      .price-divider { margin: 0.25rem 0; }

      .capacity-row {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
        color: rgba(0,0,0,0.7);
      }

      .book-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        margin-top: 0.25rem;
      }
      .book-note {
        margin: 0;
        font-size: 0.72rem;
        text-align: center;
        color: rgba(0,0,0,0.4);
      }

      /* Sections */
      .section-divider { margin: 1.5rem 0; }
      .section { margin-bottom: 0.5rem; }

      .section h3 {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 1.05rem;
        margin: 0 0 0.75rem;
        color: rgba(0,0,0,0.8);
      }

      .description { margin: 0; line-height: 1.7; color: rgba(0,0,0,0.75); }

      /* Amenities */
      .amenity-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 0.5rem;
      }
      .amenity-item {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
        color: rgba(0,0,0,0.75);
        background: rgba(30,136,229,0.07);
        border-radius: 8px;
        padding: 0.4rem 0.6rem;
      }
      .amenity-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #1e88e5; }

      /* Address */
      .address-block {
        font-style: normal;
        line-height: 1.7;
        color: rgba(0,0,0,0.75);
        margin: 0 0 0.5rem;
      }
      .address-block p { margin: 0; }
      .coords {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.85rem;
        color: rgba(0,0,0,0.5);
        margin: 0.5rem 0 0;
      }

      /* Reviews section */
      .reviews-section {
        margin-top: 0.5rem;
      }

      .reviews-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 2rem;
        color: rgba(0,0,0,0.55);
      }

      /* Meta footer */
      .meta-footer {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
      }
      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: rgba(0,0,0,0.55);
      }
      .meta-label { margin-right: 0.15rem; }
      code {
        background: rgba(0,0,0,0.06);
        border-radius: 4px;
        padding: 0.1rem 0.4rem;
        font-family: monospace;
        font-size: 0.8rem;
        color: rgba(0,0,0,0.7);
      }
    `,
  ],
})
export class SpaceDetailComponent implements OnInit {
  protected readonly space = signal<Space | null>(null);
  protected readonly loading = signal(true);

  // Reviews state
  protected readonly reviewsSummary = signal<SpaceReviewsSummary | null>(null);
  protected readonly reviewsLoading = signal(false);
  protected readonly reviewFormSubmitting = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: DeskshareApiService,
    private readonly sessionService: SessionService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadSpace(id);
    this.loadReviews(id);
  }

  private loadSpace(id: string): void {
    this.apiService.getSpaceById(id).subscribe({
      next: (s) => {
        this.space.set(s ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.space.set(null);
        this.loading.set(false);
      },
    });
  }

  loadReviews(spaceId: string): void {
    this.reviewsLoading.set(true);
    this.apiService.getReviews(spaceId).subscribe({
      next: (summary) => {
        this.reviewsSummary.set(summary);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.reviewsSummary.set(null);
        this.reviewsLoading.set(false);
      },
    });
  }

  /** Check if the current user has already reviewed this space. */
  protected hasUserReviewed = computed(() => {
    const summary = this.reviewsSummary();
    const userId = this.sessionService.userId();
    if (!summary || !userId) return false;
    return summary.reviews.some((r) => r.userId === userId);
  });

  protected onLoginRequired(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

  protected typeLabel(type: Space['type']): string {
    return spaceTypeLabel(type);
  }

  protected displayPrice(cents: number): string {
    return centsToDisplay(cents);
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  protected bookNow(): void {
    const id = this.space()?.id;
    if (id) {
      this.router.navigate(['/bookings/new'], { queryParams: { spaceId: id } });
    }
  }
}