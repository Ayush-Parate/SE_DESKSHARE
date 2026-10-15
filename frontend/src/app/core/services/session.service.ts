import { Injectable, signal, computed } from '@angular/core';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'CUSTOMER' | 'OWNER' | 'ADMIN';

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// ─── Demo sessions for each role ─────────────────────────────────────────────

export const DEMO_SESSIONS: Record<UserRole, SessionUser> = {
  CUSTOMER: {
    id: 'user-demo',
    email: 'customer@demo.deskshare',
    firstName: 'Alex',
    lastName: 'Customer',
    role: 'CUSTOMER',
  },
  OWNER: {
    id: 'owner-1',
    email: 'owner@demo.deskshare',
    firstName: 'Sam',
    lastName: 'Owner',
    role: 'OWNER',
  },
  ADMIN: {
    id: 'admin-1',
    email: 'admin@demo.deskshare',
    firstName: 'Jordan',
    lastName: 'Admin',
    role: 'ADMIN',
  },
};

const STORAGE_KEY_TOKEN = 'deskshare_token';
const STORAGE_KEY_USER = 'deskshare_user';

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Holds the current session (user, token, role).
 * Supports persistent JWT authentication in localStorage as well as
 * convenient demo role switching.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _session = signal<SessionUser | null>(null);
  private readonly _token = signal<string | null>(null);

  /** Public read-only view of the session user. */
  readonly session = this._session.asReadonly();

  /** Public read-only view of the JWT token. */
  readonly token = this._token.asReadonly();

  /** Convenience: currently authenticated user id or null. */
  readonly userId = computed(() => this._session()?.id ?? null);

  /** Convenience: currently active role or null. */
  readonly role = computed(() => this._session()?.role ?? null);

  /** True when a session exists. */
  readonly isLoggedIn = computed(() => this._session() !== null);

  /** Human-readable display name. */
  readonly displayName = computed(() => {
    const s = this._session();
    return s ? `${s.firstName} ${s.lastName}`.trim() : 'Guest';
  });

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser) as SessionUser;
          this._session.set(parsedUser);
          this._token.set(storedToken);
          return;
        }
      } catch {
        // Corrupted localStorage, ignore - remain logged out
      }
    }
    // No stored session - remain logged out (auth guard will redirect)
  }

  /**
   * Switch the active demo role.
   */
  switchRole(role: UserRole): void {
    const user = DEMO_SESSIONS[role];
    const demoToken = `demo-token-${role.toLowerCase()}`;
    this.setSession(user, demoToken);
  }

  /**
   * Set an authenticated session with JWT.
   */
  setSession(user: SessionUser, token?: string): void {
    this._session.set(user);
    const tokenVal = token ?? `demo-token-${user.role.toLowerCase()}`;
    this._token.set(tokenVal);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_TOKEN, tokenVal);
      } catch {
        // LocalStorage disabled or quota exceeded
      }
    }
  }

  /** Clear the session (log out). */
  clearSession(): void {
    this._session.set(null);
    this._token.set(null);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      } catch {
        // LocalStorage disabled
      }
    }
  }
}
