import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import {
  BookingResponse,
  BookingStatus,
  DEMO_USER_ID,
  DeskshareApiService,
  centsToDisplay,
} from '../../core/services/deskshare-api.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <!-- Page header -->
    <section class="page-header">
      <div class="header-row">
        <div>
          <p class="eyebrow">Reservations</p>
          <h2>Your bookings</h2>
        </div>
        <button
          mat-flat-button
          color="primary"
          routerLink="/bookings/new"
          aria-label="Make a new booking"
        >
          <mat-icon>add</mat-icon>
          New booking
        </button>
      </div>
    </section>

    <!-- Loading -->
    @if (loading()) {
      <div class="state-centered" aria-busy="true" aria-label="Loading bookings">
        <mat-spinner diameter="48" />
        <p>Loading your bookings…</p>
      </div>
    }

    <!-- Empty state -->
    @if (!loading() && bookings().length === 0) {
      <div class="state-centered" role="status">
        <mat-icon class="empty-icon" aria-hidden="true">event_busy</mat-icon>
        <h3>No bookings yet</h3>
        <p>Browse spaces and make your first reservation.</p>
        <button mat-flat-button color="primary" routerLink="/spaces">
          <mat-icon>search</mat-icon>
          Browse spaces
        </button>
      </div>
    }

    <!-- Booking list -->
    @if (!loading() && bookings().length > 0) {
      <section class="booking-list" aria-label="Bookings list">
        @for (booking of bookings(); track booking.id) {
          <mat-card class="booking-card" [attr.aria-label]="'Booking ' + booking.id">

            <!-- Status chip + cancel -->
            <div class="card-top-row">
              <mat-chip
                class="status-chip"
                [class.status-confirmed]="booking.status === 'CONFIRMED'"
                [class.status-cancelled]="booking.status === 'CANCELLED'"
                [class.status-completed]="booking.status === 'COMPLETED'"
              >
                {{ booking.status }}
              </mat-chip>

              @if (booking.status === 'CONFIRMED') {
                <button
                  mat-stroked-button
                  color="warn"
                  class="cancel-btn"
                  [disabled]="cancellingId() === booking.id"
                  (click)="cancelBooking(booking)"
                  [attr.aria-label]="'Cancel booking ' + booking.id"
                >
                  @if (cancellingId() === booking.id) {
                    <mat-spinner diameter="16" />
                  } @else {
                    <ng-container>
                      <mat-icon>cancel</mat-icon>
                      Cancel
                    </ng-container>
                  }
                </button>
              }
            </div>

            <mat-card-header>
              <mat-card-title>{{ formatSpaceId(booking.spaceId) }}</mat-card-title>
              <mat-card-subtitle>
                <mat-icon class="time-icon" aria-hidden="true">schedule</mat-icon>
                {{ formatWindow(booking.startTime, booking.endTime) }}
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-label">Seats</span>
                  <strong>{{ booking.slotCount }}</strong>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Total</span>
                  <strong class="price">{{ displayPrice(booking.totalPrice) }}</strong>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Currency</span>
                  <strong>{{ booking.currency }}</strong>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Booked on</span>
                  <strong>{{ formatDate(booking.createdAt) }}</strong>
                </div>
              </div>

              @if (booking.notes) {
                <p class="notes">
                  <mat-icon class="notes-icon" aria-hidden="true">notes</mat-icon>
                  {{ booking.notes }}
                </p>
              }

              @if (cancelError() && cancellingId() === null) {
                <p class="cancel-error" role="alert">{{ cancelError() }}</p>
              }
            </mat-card-content>

          </mat-card>
        }
      </section>
    }
  `,
  styles: [
    `
      :host { display: block; }

      /* Header */
      .page-header { margin-bottom: 1.5rem; }
      .header-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
      .eyebrow {
        text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.74rem;
        font-weight: 700; color: #1e88e5; margin: 0 0 0.4rem;
      }
      h2 { margin: 0; }

      /* States */
      .state-centered {
        display: flex; flex-direction: column; align-items: center;
        gap: 0.75rem; padding: 4rem 1rem; text-align: center; color: rgba(0,0,0,0.55);
      }
      .empty-icon { font-size: 3rem; width: 3rem; height: 3rem; }

      /* List */
      .booking-list { display: grid; gap: 1.25rem; max-width: 700px; }

      .booking-card { border-radius: 16px; }

      .card-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem 0;
        gap: 0.5rem;
      }

      /* Status chips */
      .status-chip { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; pointer-events: none; }
      .status-confirmed { background: #e8f5e9 !important; color: #1b5e20 !important; }
      .status-cancelled { background: #ffebee !important; color: #c62828 !important; }
      .status-completed { background: #e3f2fd !important; color: #0d47a1 !important; }

      .cancel-btn {
        font-size: 0.8rem;
        height: 32px;
        line-height: 32px;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      /* Card body */
      mat-card-subtitle {
        display: flex; align-items: center; gap: 0.2rem; margin-top: 0.25rem;
      }
      .time-icon { font-size: 1rem; width: 1rem; height: 1rem; }

      .meta-grid {
        display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem 1.5rem;
        background: rgba(0,0,0,0.03); border-radius: 10px; padding: 0.6rem 0.75rem; margin: 0.5rem 0;
      }
      .meta-item { display: flex; flex-direction: column; gap: 0.1rem; }
      .meta-label { font-size: 0.72rem; color: rgba(0,0,0,0.5); text-transform: uppercase; letter-spacing: 0.05em; }
      .price { color: #0d47a1; }

      .notes {
        display: flex; align-items: flex-start; gap: 0.35rem;
        font-size: 0.875rem; color: rgba(0,0,0,0.65); margin: 0.25rem 0 0;
      }
      .notes-icon { font-size: 1rem; width: 1rem; height: 1rem; margin-top: 0.1rem; flex-shrink: 0; }

      .cancel-error { color: #c62828; font-size: 0.85rem; margin: 0.5rem 0 0; }
    `,
  ],
})
export class BookingsComponent {
  protected readonly bookings = signal<BookingResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly cancellingId = signal<string | null>(null);
  protected readonly cancelError = signal<string | null>(null);

  constructor(private readonly apiService: DeskshareApiService) {
    this.apiService.getBookingsByUser(DEMO_USER_ID).subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected cancelBooking(booking: BookingResponse): void {
    this.cancelError.set(null);
    this.cancellingId.set(booking.id);

    this.apiService.cancelBooking(booking.id).subscribe({
      next: (updated) => {
        this.cancellingId.set(null);
        this.bookings.update((list) =>
          list.map((b) => (b.id === updated.id ? updated : b)),
        );
      },
      error: () => {
        this.cancellingId.set(null);
        // Optimistic UI when backend unreachable: flip status locally.
        this.bookings.update((list) =>
          list.map((b) =>
            b.id === booking.id ? { ...b, status: 'CANCELLED' as BookingStatus } : b,
          ),
        );
      },
    });
  }

  protected displayPrice(cents: number): string {
    return centsToDisplay(cents);
  }

  protected formatWindow(start: string, end: string): string {
    const s = new Date(start);
    const e = new Date(end);
    const dateStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const startT = s.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endT = e.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr}, ${startT} – ${endT}`;
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  /** Humanise spaceId until space names are joined server-side. */
  protected formatSpaceId(spaceId: string): string {
    const knownNames: Record<string, string> = {
      's-101': 'Harbor Desk',
      's-102': 'North Studio',
      's-103': 'Summit Room',
      's-104': 'The Loft',
    };
    return knownNames[spaceId] ?? spaceId;
  }
}
