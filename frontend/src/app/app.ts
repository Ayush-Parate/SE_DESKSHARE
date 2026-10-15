import { Component, inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SessionService, UserRole } from './core/services/session.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = 'DeskShare';
  protected readonly session = inject(SessionService);

  protected readonly navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Spaces', path: '/spaces' },
    { label: 'Bookings', path: '/bookings' },
    { label: 'Dashboard', path: '/dashboard' },
  ];

  protected readonly roleOptions: { value: UserRole; label: string }[] = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'OWNER', label: 'Owner' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  protected switchRole(role: UserRole): void {
    this.session.switchRole(role);
  }

  protected logout(): void {
    this.session.clearSession();
  }

  protected readonly isDemoSession = computed(() => {
    const token = this.session.token();
    return token?.startsWith('demo-token-') ?? false;
  });
}
