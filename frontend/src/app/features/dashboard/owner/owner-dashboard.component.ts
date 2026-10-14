import { Component, inject, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';

import {
  BookingResponse,
  DeskshareApiService,
  Space,
  centsToDisplay,
  spaceTypeLabel,
} from '../../../core/services/deskshare-api.service';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  template: `
    <!-- Summary stats -->
    <div class="stat-row" role="list" aria-label="Owner summary">
      <div class="stat-card" role="listitem">
        <mat-icon aria-hidden="true">meeting_room</mat-icon>
        <div class="stat-value">{{ spaces().length }}</div>
        <div class="stat-label">Spaces</div>
      </div>
      <div class="stat-card" role="listitem">
        <mat-icon aria-hidden="true">event_note</mat-icon>
        <div class="stat-value">{{ bookings().length }}</div>
        <div class="stat-label">Bookings</div>
      </div>
      <div class="stat-card stat-card--accent" role="listitem">
        <mat-icon aria-hidden="true">payments</mat-icon>
        <div class="stat-value">{{ totalRevenue() }}</div>
        <div class="stat-label">Revenue</div>
      </div>
    </div>

    @if (loading()) {
      <div class="state-centered" aria-busy="true">
        <mat-spinner diameter="44" />
        <p>Loading your spaces and bookings…</p>
      </div>
    }

    @if (!loading()) {
      <!-- Spaces list -->
      <section aria-labelledby="spaces-heading">
        <div class="section-header-row">
          <h3 id="spaces-heading" class="section-heading">
            <mat-icon aria-hidden="true">meeting_room</mat-icon>
            Your spaces
          </h3>
          <button mat-stroked-button color="primary" (click)="browseSpaces()">
            <mat-icon>add</mat-icon>
            Manage spaces
          </button>
        </div>

        @if (spaces().length === 0) {
          <p class="empty-text">No spaces yet. Create your first listing.</p>
        } @else {
          <div class="spaces-grid">
            @for (sp of spaces(); track sp.id) {
              <mat-card class="space-card" [class.space-card--inactive]="!sp.active">
                <mat-card-header>
                  <mat-card-title>{{ sp.name }}</mat-card-title>
                  <mat-card-subtitle>{{ sp.address.city }}, {{ sp.address.state }} · {{ typeLabel(sp.type) }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="meta-row">
                    <span>Capacity</span><strong>{{ sp.totalCapacity }} seats</strong>
                  </div>
                  <div class="meta-row">
                    <span>Hourly rate</span><strong class="price">{{ displayPrice(sp.priceHourly) }}</strong>
                  </div>
                  <div class="meta-row">
                    <span>Bookings</span><strong>{{ bookingsForSpace(sp.id).length }}</strong>
                  </div>
                  <div class="meta-row">
                    <span>Revenue</span><strong class="price">{{ revenueForSpace(sp.id) }}</strong>
                  </div>

                  <!-- Active toggle -->
                  <div class="toggle-row">
                    <span class="toggle-label">{{ sp.active ? 'Active' : 'Inactive' }}</span>
                    <mat-slide-toggle
                      [checked]="sp.active"
                      [disabled]="togglingId() === sp.id"
                      (change)="toggleActive(sp)"
                      [attr.aria-label]="'Toggle active status for ' + sp.name"
                    />
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        }
      </section>

      <!-- Recent bookings -->
      <section aria-labelledby="bookings-heading" class="section-gap">
        <h3 id="bookings-heading" class="section-heading">
          <mat-icon aria-hidden="true">event_note</mat-icon>
          Recent bookings for your spaces
        </h3>

        @if (bookings().length === 0) {
          <p class="empty-text">No bookings yet for your spaces.</p>
        } @else {
          <div class="booking-list">
            @for (b of recentBookings(); track b.id) {
              <div class="booking-row">
                <div class="booking-space">{{ spaceName(b.spaceId) }}</div>
                <div class="booking-window">{{ formatWindow(b.startTime, b.endTime) }}</div>
                <div class="booking-seats">{{ b.slotCount }} seat{{ b.slotCount > 1 ? 's' : '' }}</div>
                <div class="booking-total price">{{ displayPrice(b.totalPrice) }}</div>
                <mat-chip [class]="statusClass(b.status)">{{ b.status }}</mat-chip>
              </div>
            }
            @if (bookings().length > 8) {
              <p class="show-more-note">Showing 8 most recent. Total: {{ bookings().length }}</p>
            }
          </div>
        }
      </section>
    }
  `,
  styles: [`
    :host { display: block; }

    .stat-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
    .stat-card {
      flex: 1 1 140px; background: var(--mat-sys-surface-container-low, #f5f8ff);
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

    .section-header-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
    .section-heading { display: flex; align-items: center; gap: 0.4rem; font-size: 1rem; font-weight: 600; margin: 0; }
    .section-gap { margin-top: 2rem; }
    .empty-text { color: rgba(0,0,0,0.55); }

    .spaces-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .space-card { border-radius: 14px; }
    .space-card--inactive { opacity: 0.6; }
    .meta-row { display: flex; justify-content: space-between; margin: 0.35rem 0; font-size: 0.9rem; }
    .price { color: #0d47a1; }

    .toggle-row { display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.08); }
    .toggle-label { font-size: 0.875rem; color: rgba(0,0,0,0.65); }

    .booking-list { display: flex; flex-direction: column; gap: 0.5rem; max-width: 800px; }
    .booking-row {
      display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1rem;
      background: var(--mat-sys-surface-container-low, #f5f8ff);
      border-radius: 10px; padding: 0.6rem 0.9rem; font-size: 0.875rem;
    }
    .booking-space { font-weight: 600; min-width: 120px; }
    .booking-window { color: rgba(0,0,0,0.6); flex: 1 1 200px; }
    .booking-seats { color: rgba(0,0,0,0.6); }
    .booking-total { font-weight: 600; }
    .show-more-note { font-size: 0.82rem; color: rgba(0,0,0,0.45); margin: 0.5rem 0 0; }

    .status-confirmed { background: #e8f5e9 !important; color: #1b5e20 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .status-cancelled { background: #ffebee !important; color: #c62828 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .status-completed { background: #e3f2fd !important; color: #0d47a1 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
  `],
})
export class OwnerDashboardComponent {
  protected readonly spaces = signal<Space[]>([]);
  protected readonly bookings = signal<BookingResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly togglingId = signal<string | null>(null);

  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly totalRevenue = computed(() =>
    centsToDisplay(
      this.bookings()
        .filter((b) => b.status !== 'CANCELLED')
        .reduce((sum, b) => sum + b.totalPrice, 0),
    ),
  );

  protected readonly recentBookings = computed(() =>
    [...this.bookings()]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 8),
  );

  constructor(private readonly api: DeskshareApiService) {
    const ownerId = this.session.userId() ?? 'owner-1';

    this.api.getSpaces({ ownerId }).subscribe({
      next: (data) => {
        this.spaces.set(data);
        if (this.bookings() !== undefined) this.checkDoneLoading();
      },
      error: () => this.loading.set(false),
    });

    this.api.getBookingsByOwner(ownerId).subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.checkDoneLoading();
      },
      error: () => this.loading.set(false),
    });
  }

  private checkDoneLoading(): void {
    this.loading.set(false);
  }

  protected toggleActive(sp: Space): void {
    this.togglingId.set(sp.id);
    this.api.updateSpaceActive(sp.id, !sp.active).subscribe({
      next: (updated) => {
        this.togglingId.set(null);
        this.spaces.update((list) => list.map((s) => s.id === updated.id ? updated : s));
      },
      error: () => {
        this.togglingId.set(null);
        // Optimistic flip
        this.spaces.update((list) =>
          list.map((s) => s.id === sp.id ? { ...s, active: !s.active } : s),
        );
      },
    });
  }

  protected browseSpaces(): void { this.router.navigate(['/spaces']); }
  protected displayPrice(cents: number): string { return centsToDisplay(cents); }
  protected typeLabel(t: Space['type']): string { return spaceTypeLabel(t); }

  protected bookingsForSpace(spaceId: string): BookingResponse[] {
    return this.bookings().filter((b) => b.spaceId === spaceId && b.status !== 'CANCELLED');
  }

  protected revenueForSpace(spaceId: string): string {
    return centsToDisplay(
      this.bookingsForSpace(spaceId).reduce((s, b) => s + b.totalPrice, 0),
    );
  }

  protected formatWindow(start: string, end: string): string {
    const s = new Date(start);
    return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ', ' + s.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  protected spaceName(spaceId: string): string {
    return this.spaces().find((s) => s.id === spaceId)?.name ?? spaceId;
  }

  protected statusClass(status: string): string { return `status-${status.toLowerCase()}`; }
}
