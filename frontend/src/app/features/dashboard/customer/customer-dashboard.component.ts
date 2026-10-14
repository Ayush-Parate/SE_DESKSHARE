import { Component, inject, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import {
  BookingResponse,
  BookingStatus,
  DeskshareApiService,
  centsToDisplay,
} from '../../../core/services/deskshare-api.service';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <!-- Summary stat cards -->
    <div class="stat-row" role="list" aria-label="Booking summary">
      <div class="stat-card" role="listitem">
        <mat-icon aria-hidden="true">event_available</mat-icon>
        <div class="stat-value">{{ upcoming().length }}</div>
        <div class="stat-label">Upcoming</div>
      </div>
      <div class="stat-card" role="listitem">
        <mat-icon aria-hidden="true">history</mat-icon>
        <div class="stat-value">{{ past().length }}</div>
        <div class="stat-label">Past bookings</div>
      </div>
      <div class="stat-card stat-card--accent" role="listitem">
        <mat-icon aria-hidden="true">payments</mat-icon>
        <div class="stat-value">{{ totalSpend() }}</div>
        <div class="stat-label">Total spent</div>
      </div>
    </div>

    <!-- Loading -->
    @if (loading()) {
      <div class="state-centered" aria-busy="true">
        <mat-spinner diameter="44" />
        <p>Loading your bookings…</p>
      </div>
    }

    <!-- Upcoming bookings -->
    @if (!loading()) {
      <section aria-labelledby="upcoming-heading">
        <h3 id="upcoming-heading" class="section-heading">
          <mat-icon aria-hidden="true">event_available</mat-icon>
          Upcoming bookings
        </h3>

        @if (upcoming().length === 0) {
          <p class="empty-text">No upcoming bookings. <a class="link" (click)="browseSpaces()">Browse spaces</a> to book one.</p>
        } @else {
          <div class="booking-grid">
            @for (b of upcoming(); track b.id) {
              <mat-card class="booking-card">
                <mat-card-header>
                  <mat-card-title>{{ spaceName(b.spaceId) }}</mat-card-title>
                  <mat-card-subtitle>{{ formatWindow(b.startTime, b.endTime) }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="meta-row">
                    <span>Seats</span><strong>{{ b.slotCount }}</strong>
                  </div>
                  <div class="meta-row">
                    <span>Total</span><strong class="price">{{ displayPrice(b.totalPrice) }}</strong>
                  </div>
                </mat-card-content>
                <mat-card-actions align="end">
                  <mat-chip [class]="statusClass(b.status)">{{ b.status }}</mat-chip>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        }
      </section>

      <!-- Past bookings -->
      <section aria-labelledby="past-heading" class="section-gap">
        <h3 id="past-heading" class="section-heading">
          <mat-icon aria-hidden="true">history</mat-icon>
          Past bookings
        </h3>

        @if (past().length === 0) {
          <p class="empty-text">No past bookings yet.</p>
        } @else {
          <div class="booking-grid">
            @for (b of past(); track b.id) {
              <mat-card class="booking-card booking-card--muted">
                <mat-card-header>
                  <mat-card-title>{{ spaceName(b.spaceId) }}</mat-card-title>
                  <mat-card-subtitle>{{ formatWindow(b.startTime, b.endTime) }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="meta-row">
                    <span>Total</span><strong class="price">{{ displayPrice(b.totalPrice) }}</strong>
                  </div>
                </mat-card-content>
                <mat-card-actions align="end">
                  <mat-chip [class]="statusClass(b.status)">{{ b.status }}</mat-chip>
                  <button
                    mat-stroked-button
                    color="primary"
                    (click)="bookAgain(b.spaceId)"
                    aria-label="Book this space again"
                  >
                    <mat-icon>replay</mat-icon>
                    Book again
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        }
      </section>
    }
  `,
  styles: [`
    :host { display: block; }

    .stat-row {
      display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;
    }
    .stat-card {
      flex: 1 1 140px; min-width: 120px;
      background: var(--mat-sys-surface-container-low, #f5f8ff);
      border-radius: 14px; padding: 1rem 1.25rem;
      display: flex; flex-direction: column; align-items: flex-start; gap: 0.3rem;
    }
    .stat-card mat-icon { color: #1e88e5; }
    .stat-card--accent mat-icon { color: #0d47a1; }
    .stat-value { font-size: 1.6rem; font-weight: 700; color: #0d47a1; line-height: 1; }
    .stat-label { font-size: 0.78rem; color: rgba(0,0,0,0.55); text-transform: uppercase; letter-spacing: 0.06em; }

    .state-centered {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.75rem; padding: 3rem 1rem; color: rgba(0,0,0,0.55);
    }

    .section-heading {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 1rem; font-weight: 600; margin: 0 0 0.75rem;
    }
    .section-gap { margin-top: 2rem; }
    .empty-text { color: rgba(0,0,0,0.55); }
    .link { color: #1e88e5; cursor: pointer; text-decoration: underline; }

    .booking-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem;
    }
    .booking-card { border-radius: 14px; }
    .booking-card--muted { opacity: 0.85; }
    .meta-row { display: flex; justify-content: space-between; margin: 0.35rem 0; font-size: 0.9rem; }
    .price { color: #0d47a1; }

    .status-confirmed { background: #e8f5e9 !important; color: #1b5e20 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .status-cancelled { background: #ffebee !important; color: #c62828 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .status-completed { background: #e3f2fd !important; color: #0d47a1 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
  `],
})
export class CustomerDashboardComponent {
  protected readonly bookings = signal<BookingResponse[]>([]);
  protected readonly loading = signal(true);

  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly upcoming = computed(() =>
    this.bookings().filter(
      (b) => b.status === 'CONFIRMED' && new Date(b.startTime) > new Date(),
    ),
  );

  protected readonly past = computed(() =>
    this.bookings().filter(
      (b) => b.status === 'COMPLETED' || b.status === 'CANCELLED' ||
             (b.status === 'CONFIRMED' && new Date(b.startTime) <= new Date()),
    ),
  );

  protected readonly totalSpend = computed(() =>
    centsToDisplay(
      this.bookings()
        .filter((b) => b.status !== 'CANCELLED')
        .reduce((sum, b) => sum + b.totalPrice, 0),
    ),
  );

  constructor(private readonly api: DeskshareApiService) {
    const uid = this.session.userId() ?? 'user-demo';
    this.api.getBookingsByUser(uid).subscribe({
      next: (data) => { this.bookings.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected bookAgain(spaceId: string): void {
    this.router.navigate(['/bookings/new'], { queryParams: { spaceId } });
  }

  protected browseSpaces(): void {
    this.router.navigate(['/spaces']);
  }

  protected displayPrice(cents: number): string { return centsToDisplay(cents); }

  protected formatWindow(start: string, end: string): string {
    const s = new Date(start);
    const e = new Date(end);
    const date = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const st = s.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const et = e.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${date}, ${st} – ${et}`;
  }

  protected spaceName(spaceId: string): string {
    const map: Record<string, string> = {
      's-101': 'Harbor Desk', 's-102': 'North Studio',
      's-103': 'Summit Room', 's-104': 'The Loft',
    };
    return map[spaceId] ?? spaceId;
  }

  protected statusClass(status: BookingStatus): string {
    return `status-${status.toLowerCase()}`;
  }
}
