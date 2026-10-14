import { Component, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import {
  BookingResponse,
  DeskshareApiService,
  Space,
  UserResponse,
  centsToDisplay,
  spaceTypeLabel,
} from '../../../core/services/deskshare-api.service';

type AdminTab = 'users' | 'spaces' | 'bookings';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  template: `
    <!-- Summary stat cards -->
    <div class="stat-row" role="list" aria-label="Platform summary">
      <div class="stat-card" role="listitem">
        <mat-icon aria-hidden="true">group</mat-icon>
        <div class="stat-value">{{ users().length }}</div>
        <div class="stat-label">Users</div>
      </div>
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
        <div class="stat-value">{{ platformRevenue() }}</div>
        <div class="stat-label">Platform revenue</div>
      </div>
    </div>

    <!-- Tab switcher -->
    <div class="tab-row" role="tablist" aria-label="Admin data tables">
      @for (tab of tabs; track tab.key) {
        <button
          mat-stroked-button
          class="tab-btn"
          [class.tab-btn--active]="activeTab() === tab.key"
          (click)="setTab(tab.key)"
          role="tab"
          [attr.aria-selected]="activeTab() === tab.key"
          [attr.aria-controls]="tab.key + '-panel'"
        >
          <mat-icon>{{ tab.icon }}</mat-icon>
          {{ tab.label }}
        </button>
      }
    </div>

    @if (loading()) {
      <div class="state-centered" aria-busy="true">
        <mat-spinner diameter="44" />
        <p>Loading platform data…</p>
      </div>
    }

    @if (!loading()) {
      <!-- Users table -->
      @if (activeTab() === 'users') {
        <section id="users-panel" role="tabpanel" aria-labelledby="users-tab">
          <table mat-table [dataSource]="users()" class="data-table" aria-label="Users">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let u">{{ u.firstName }} {{ u.lastName }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let u">
                <mat-chip [class]="roleClass(u.role)">{{ u.role }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let u">
                <mat-chip [class]="u.active ? 'chip-active' : 'chip-inactive'">
                  {{ u.active ? 'Active' : 'Inactive' }}
                </mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="joined">
              <th mat-header-cell *matHeaderCellDef>Joined</th>
              <td mat-cell *matCellDef="let u">{{ formatDate(u.createdAt) }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
          </table>
        </section>
      }

      <!-- Spaces table -->
      @if (activeTab() === 'spaces') {
        <section id="spaces-panel" role="tabpanel" aria-labelledby="spaces-tab">
          <table mat-table [dataSource]="spaces()" class="data-table" aria-label="Spaces">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let s">{{ s.name }}</td>
            </ng-container>
            <ng-container matColumnDef="city">
              <th mat-header-cell *matHeaderCellDef>City</th>
              <td mat-cell *matCellDef="let s">{{ s.address.city }}, {{ s.address.state }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let s">{{ typeLabel(s.type) }}</td>
            </ng-container>
            <ng-container matColumnDef="capacity">
              <th mat-header-cell *matHeaderCellDef>Capacity</th>
              <td mat-cell *matCellDef="let s">{{ s.totalCapacity }}</td>
            </ng-container>
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Hourly</th>
              <td mat-cell *matCellDef="let s">{{ displayPrice(s.priceHourly) }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let s">
                <mat-chip [class]="s.active ? 'chip-active' : 'chip-inactive'">
                  {{ s.active ? 'Active' : 'Inactive' }}
                </mat-chip>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="spaceColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: spaceColumns;"></tr>
          </table>
        </section>
      }

      <!-- Bookings table -->
      @if (activeTab() === 'bookings') {
        <section id="bookings-panel" role="tabpanel" aria-labelledby="bookings-tab">
          <table mat-table [dataSource]="allBookings()" class="data-table" aria-label="Bookings">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let b"><code>{{ b.id.slice(0, 10) }}…</code></td>
            </ng-container>
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let b">{{ b.userId }}</td>
            </ng-container>
            <ng-container matColumnDef="space">
              <th mat-header-cell *matHeaderCellDef>Space</th>
              <td mat-cell *matCellDef="let b">{{ b.spaceId }}</td>
            </ng-container>
            <ng-container matColumnDef="window">
              <th mat-header-cell *matHeaderCellDef>Start</th>
              <td mat-cell *matCellDef="let b">{{ formatDate(b.startTime) }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let b" class="price">{{ displayPrice(b.totalPrice) }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let b">
                <mat-chip [class]="statusClass(b.status)">{{ b.status }}</mat-chip>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="bookingColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: bookingColumns;"></tr>
          </table>
        </section>
      }
    }
  `,
  styles: [`
    :host { display: block; }

    .stat-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
    .stat-card {
      flex: 1 1 130px; background: var(--mat-sys-surface-container-low, #f5f8ff);
      border-radius: 14px; padding: 1rem 1.25rem;
      display: flex; flex-direction: column; align-items: flex-start; gap: 0.3rem;
    }
    .stat-card mat-icon { color: #1e88e5; }
    .stat-card--accent mat-icon { color: #0d47a1; }
    .stat-value { font-size: 1.6rem; font-weight: 700; color: #0d47a1; line-height: 1; }
    .stat-label { font-size: 0.78rem; color: rgba(0,0,0,0.55); text-transform: uppercase; letter-spacing: 0.06em; }

    .tab-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
    .tab-btn { border-radius: 100px; }
    .tab-btn--active { background: #e3f2fd; border-color: #1e88e5; color: #0d47a1; }

    .state-centered { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 1rem; color: rgba(0,0,0,0.55); }

    .data-table { width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

    code { background: rgba(0,0,0,0.06); border-radius: 4px; padding: 0.1rem 0.4rem; font-family: monospace; font-size: 0.8rem; }
    .price { color: #0d47a1; font-weight: 600; }

    /* Status / role chips */
    .chip-active   { background: #e8f5e9 !important; color: #1b5e20 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .chip-inactive { background: #ffebee !important; color: #c62828 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .role-customer { background: #e3f2fd !important; color: #0d47a1 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .role-owner    { background: #fff3e0 !important; color: #e65100 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .role-admin    { background: #f3e5f5 !important; color: #6a1b9a !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .status-confirmed { background: #e8f5e9 !important; color: #1b5e20 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .status-cancelled { background: #ffebee !important; color: #c62828 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
    .status-completed { background: #e3f2fd !important; color: #0d47a1 !important; pointer-events: none; font-size: 0.72rem; font-weight: 700; }
  `],
})
export class AdminDashboardComponent {
  protected readonly users = signal<UserResponse[]>([]);
  protected readonly spaces = signal<Space[]>([]);
  protected readonly bookings = signal<BookingResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly activeTab = signal<AdminTab>('users');

  readonly userColumns = ['name', 'email', 'role', 'active', 'joined'];
  readonly spaceColumns = ['name', 'city', 'type', 'capacity', 'price', 'status'];
  readonly bookingColumns = ['id', 'user', 'space', 'window', 'total', 'status'];

  readonly tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: 'users', label: 'Users', icon: 'group' },
    { key: 'spaces', label: 'Spaces', icon: 'meeting_room' },
    { key: 'bookings', label: 'Bookings', icon: 'event_note' },
  ];

  protected readonly platformRevenue = computed(() =>
    centsToDisplay(
      this.bookings()
        .filter((b) => b.status !== 'CANCELLED')
        .reduce((sum, b) => sum + b.totalPrice, 0),
    ),
  );

  /** Bookings across all users — for admin we aggregate from the known mock user */
  protected readonly allBookings = computed(() => this.bookings());

  private loadedCount = 0;

  constructor(private readonly api: DeskshareApiService) {
    this.api.getUsers().subscribe({
      next: (d) => { this.users.set(d); this.tick(); },
      error: () => this.loading.set(false),
    });
    this.api.getSpaces().subscribe({
      next: (d) => { this.spaces.set(d); this.tick(); },
      error: () => this.loading.set(false),
    });
    // Aggregate bookings: fetch for demo user + owner-1 for richer mock data
    this.api.getBookingsByUser('user-demo').subscribe({
      next: (d) => { this.bookings.set(d); this.tick(); },
      error: () => this.loading.set(false),
    });
  }

  private tick(): void {
    this.loadedCount++;
    if (this.loadedCount >= 3) this.loading.set(false);
  }

  protected setTab(tab: AdminTab): void { this.activeTab.set(tab); }
  protected displayPrice(cents: number): string { return centsToDisplay(cents); }
  protected typeLabel(t: Space['type']): string { return spaceTypeLabel(t); }
  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  protected roleClass(role: string): string { return `role-${role.toLowerCase()}`; }
  protected statusClass(status: string): string { return `status-${status.toLowerCase()}`; }
}
