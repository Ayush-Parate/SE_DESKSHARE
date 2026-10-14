import { Component, inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { SessionService, UserRole } from '../../core/services/session.service';
import { CustomerDashboardComponent } from './customer/customer-dashboard.component';
import { OwnerDashboardComponent } from './owner/owner-dashboard.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    CustomerDashboardComponent,
    OwnerDashboardComponent,
    AdminDashboardComponent,
  ],
  template: `
    <!-- Dashboard header -->
    <section class="page-header">
      <p class="eyebrow">{{ greeting() }}</p>
      <h2>Dashboard</h2>
      <p class="sub">
        You are viewing as <strong>{{ session.role() }}</strong>.
        Switch roles using the dropdown in the top navigation bar.
      </p>
    </section>

    <!-- Role-based tab strip -->
    <mat-tab-group
      [selectedIndex]="activeTabIndex()"
      (selectedIndexChange)="onTabChange($event)"
      animationDuration="200ms"
      aria-label="Dashboard views"
    >
      <mat-tab label="Customer">
        <ng-template matTabLabel>
          <mat-icon>person</mat-icon>
          Customer
        </ng-template>
        <div class="tab-content">
          <app-customer-dashboard />
        </div>
      </mat-tab>

      <mat-tab label="Owner">
        <ng-template matTabLabel>
          <mat-icon>business</mat-icon>
          Owner
        </ng-template>
        <div class="tab-content">
          <app-owner-dashboard />
        </div>
      </mat-tab>

      <mat-tab label="Admin">
        <ng-template matTabLabel>
          <mat-icon>admin_panel_settings</mat-icon>
          Admin
        </ng-template>
        <div class="tab-content">
          <app-admin-dashboard />
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    :host { display: block; }

    .page-header { margin-bottom: 1.5rem; }
    .eyebrow {
      text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.74rem;
      font-weight: 700; color: #1e88e5; margin: 0 0 0.4rem;
    }
    h2 { margin: 0 0 0.4rem; }
    .sub { margin: 0; color: rgba(0,0,0,0.6); font-size: 0.9rem; }

    .tab-content { padding: 1.5rem 0 0; }
  `],
})
export class DashboardComponent {
  protected readonly session = inject(SessionService);

  /** Map role to tab index: CUSTOMER=0, OWNER=1, ADMIN=2 */
  private readonly roleTabMap: Record<UserRole, number> = {
    CUSTOMER: 0,
    OWNER: 1,
    ADMIN: 2,
  };

  protected readonly activeTabIndex = computed(() => {
    const role = this.session.role();
    return role ? (this.roleTabMap[role] ?? 0) : 0;
  });

  protected readonly greeting = computed(() => {
    const name = this.session.displayName();
    const hour = new Date().getHours();
    const prefix = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${prefix}, ${name}`;
  });

  protected onTabChange(index: number): void {
    const roles: UserRole[] = ['CUSTOMER', 'OWNER', 'ADMIN'];
    const role = roles[index];
    if (role) this.session.switchRole(role);
  }
}
