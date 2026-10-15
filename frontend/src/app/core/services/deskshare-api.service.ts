import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

// ─── Domain models ────────────────────────────────────────────────────────────

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type SpaceType =
  | 'HOT_DESK'
  | 'DEDICATED_DESK'
  | 'PRIVATE_OFFICE'
  | 'MEETING_ROOM';

/** Mirrors the backend SpaceResponse record exactly. Prices are in cents. */
export interface Space {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: Address;
  longitude: number | null;
  latitude: number | null;
  type: SpaceType;
  totalCapacity: number;
  priceHourly: number; // cents
  priceDaily: number;  // cents
  amenities: string[];
  imageUrls: string[];
  active: boolean;
  createdAt: string;
}

/** Query params accepted by GET /api/v1/spaces */
export interface SpaceFilter {
  ownerId?: string;
  city?: string;
  type?: SpaceType;
  amenity?: string;
  minPrice?: number; // cents
  maxPrice?: number; // cents
}

// ─── Booking models ───────────────────────────────────────────────────────────

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

/** Mirrors the backend BookingResponse record exactly. totalPrice is in cents. */
export interface BookingResponse {
  id: string;
  userId: string;
  spaceId: string;
  ownerId: string;
  startTime: string;   // ISO-8601 Instant
  endTime: string;     // ISO-8601 Instant
  slotCount: number;
  totalPrice: number;  // cents
  currency: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
}

/** Mirrors the backend CreateBookingRequest record. */
export interface CreateBookingRequest {
  userId: string;
  spaceId: string;
  startTime: string;   // ISO-8601 Instant (must be future)
  endTime: string;     // ISO-8601 Instant (must be future)
  slotCount: number;
  notes?: string;
}

// ─── Legacy narrow type kept for Bookings page ────────────────────────────────

/** @deprecated Use BookingResponse instead. Kept until BookingsComponent is migrated. */
export interface BookingSummary {
  id: string;
  spaceName: string;
  dateLabel: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
  total: number;
}

// ─── Mock fallback data ───────────────────────────────────────────────────────

/* eslint-disable max-len */
const mockSpaces: Space[] = [
  {
    id: 's-101',
    ownerId: 'owner-1',
    name: 'Harbor Desk',
    description: 'A bright, open coworking floor in the heart of Seattle waterfront with panoramic views and high-speed fibre.',
    address: { street: '101 Harbor Ave', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'US' },
    longitude: -122.3365,
    latitude: 47.6062,
    type: 'HOT_DESK',
    totalCapacity: 8,
    priceHourly: 700,
    priceDaily: 4200,
    amenities: ['WiFi', 'Coffee', 'Standing Desks', 'Locker'],
    imageUrls: [],
    active: true,
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 's-102',
    ownerId: 'owner-2',
    name: 'North Studio',
    description: 'Fully private office suite in Austin tech corridor — ideal for small teams who need quiet focus time.',
    address: { street: '250 Congress Ave', city: 'Austin', state: 'TX', postalCode: '78701', country: 'US' },
    longitude: -97.7431,
    latitude: 30.2672,
    type: 'PRIVATE_OFFICE',
    totalCapacity: 4,
    priceHourly: 2000,
    priceDaily: 14000,
    amenities: ['WiFi', 'Whiteboard', 'Phone Booth', 'Kitchen'],
    imageUrls: [],
    active: true,
    createdAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 's-103',
    ownerId: 'owner-1',
    name: 'Summit Room',
    description: 'A polished meeting room in Midtown Manhattan — AV-ready with a 10-person board table and catering options.',
    address: { street: '350 5th Ave', city: 'New York', state: 'NY', postalCode: '10118', country: 'US' },
    longitude: -73.9857,
    latitude: 40.7484,
    type: 'MEETING_ROOM',
    totalCapacity: 10,
    priceHourly: 3500,
    priceDaily: 9600,
    amenities: ['WiFi', 'Projector', 'TV Screen', 'Video Conferencing', 'Catering'],
    imageUrls: [],
    active: true,
    createdAt: '2026-10-03T10:00:00Z',
  },
  {
    id: 's-104',
    ownerId: 'owner-3',
    name: 'The Loft',
    description: 'An airy dedicated desk space in Chicago West Loop — perfect for remote workers who need a consistent spot.',
    address: { street: '1 N Dearborn St', city: 'Chicago', state: 'IL', postalCode: '60602', country: 'US' },
    longitude: -87.6298,
    latitude: 41.8827,
    type: 'DEDICATED_DESK',
    totalCapacity: 6,
    priceHourly: 1000,
    priceDaily: 6500,
    amenities: ['WiFi', 'Coffee', 'Mail Handling', 'Printing'],
    imageUrls: [],
    active: true,
    createdAt: '2026-10-04T11:00:00Z',
  },
];
/* eslint-enable max-len */

const mockBookings: BookingResponse[] = [
  {
    id: 'b-201',
    userId: 'user-demo',
    spaceId: 's-101',
    ownerId: 'owner-1',
    startTime: '2026-10-18T09:00:00Z',
    endTime: '2026-10-18T12:00:00Z',
    slotCount: 1,
    totalPrice: 2100,
    currency: 'USD',
    status: 'CONFIRMED',
    notes: null,
    createdAt: '2026-10-14T06:00:00Z',
  },
  {
    id: 'b-202',
    userId: 'user-demo',
    spaceId: 's-102',
    ownerId: 'owner-2',
    startTime: '2026-10-22T14:00:00Z',
    endTime: '2026-10-22T18:00:00Z',
    slotCount: 2,
    totalPrice: 16000,
    currency: 'USD',
    status: 'CONFIRMED',
    notes: 'Need projector access',
    createdAt: '2026-10-14T06:30:00Z',
  },
  {
    id: 'b-203',
    userId: 'user-demo',
    spaceId: 's-103',
    ownerId: 'owner-1',
    startTime: '2026-10-10T10:00:00Z',
    endTime: '2026-10-10T13:00:00Z',
    slotCount: 1,
    totalPrice: 10500,
    currency: 'USD',
    status: 'COMPLETED',
    notes: null,
    createdAt: '2026-10-08T08:00:00Z',
  },
];

// ─── User model ───────────────────────────────────────────────────────────────

export type UserRole = 'CUSTOMER' | 'OWNER' | 'ADMIN';

/** Mirrors the backend UserResponse record. */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

// ─── Mock users ───────────────────────────────────────────────────────────────

const mockUsers: UserResponse[] = [
  { id: 'user-demo', email: 'customer@demo.deskshare', firstName: 'Alex', lastName: 'Customer', phone: null, role: 'CUSTOMER', active: true, createdAt: '2026-10-01T00:00:00Z' },
  { id: 'owner-1', email: 'owner@demo.deskshare', firstName: 'Sam', lastName: 'Owner', phone: '+1-555-0101', role: 'OWNER', active: true, createdAt: '2026-10-01T00:00:00Z' },
  { id: 'owner-2', email: 'owner2@demo.deskshare', firstName: 'Taylor', lastName: 'Owner', phone: null, role: 'OWNER', active: true, createdAt: '2026-10-02T00:00:00Z' },
  { id: 'owner-3', email: 'owner3@demo.deskshare', firstName: 'Morgan', lastName: 'Owner', phone: null, role: 'OWNER', active: true, createdAt: '2026-10-03T00:00:00Z' },
  { id: 'admin-1', email: 'admin@demo.deskshare', firstName: 'Jordan', lastName: 'Admin', phone: null, role: 'ADMIN', active: true, createdAt: '2026-09-15T00:00:00Z' },
];

// ─── Demo / placeholder ───────────────────────────────────────────────────────

/**
 * Placeholder user ID used until a real JWT session replaces the offline demo.
 * Prefer SessionService.userId() when calling authenticated APIs.
 */
export const DEMO_USER_ID = 'user-demo';

/** Shared password for embedded-profile demo users (see DemoDataSeeder). */
export const DEMO_PASSWORD = 'demo1234';

/** Mirrors backend AuthResponse. */
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

/** Request payload for POST /api/v1/auth/register */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

// ─── Review models ──────────────────────────────────────────────────────────────

/** Mirrors backend CreateReviewRequest. */
export interface CreateReviewRequest {
  rating: number;     // 1–5
  comment: string;    // max 1000 chars
}

/** Mirrors backend ReviewResponse. */
export interface ReviewResponse {
  id: string;
  spaceId: string;
  userId: string;
  authorName: string;
  rating: number;     // 1–5
  comment: string;
  createdAt: string;  // ISO-8601
}

/** Mirrors backend SpaceReviewsSummary. */
export interface SpaceReviewsSummary {
  spaceId: string;
  averageRating: number;
  reviewCount: number;
  reviews: ReviewResponse[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DeskshareApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  /** POST /api/v1/auth/login — returns a signed JWT session. */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  /** POST /api/v1/auth/register — creates account and returns a signed JWT session. */
  register(firstName: string, lastName: string, email: string, password: string, role: UserRole): Observable<AuthResponse> {
    const body: RegisterRequest = { firstName, lastName, email, password, role };
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, body);
  }

  /** Fetch spaces, optionally filtered. Falls back to mock data when API is unreachable. */
  getSpaces(filter: SpaceFilter = {}): Observable<Space[]> {
    let params = new HttpParams();
    if (filter.ownerId) params = params.set('ownerId', filter.ownerId);
    if (filter.city) params = params.set('city', filter.city);
    if (filter.type) params = params.set('type', filter.type);
    if (filter.amenity) params = params.set('amenity', filter.amenity);
    if (filter.minPrice != null) params = params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice != null) params = params.set('maxPrice', filter.maxPrice.toString());

    return this.http
      .get<Space[]>(`${this.baseUrl}/spaces`, { params })
      .pipe(
        catchError(() => {
          return of(this.applyMockFilter(filter));
        }),
      );
  }

  /** Fetch a single space by ID. Falls back to finding it in the mock list. */
  getSpaceById(id: string): Observable<Space> {
    return this.http
      .get<Space>(`${this.baseUrl}/spaces/${id}`)
      .pipe(
        catchError(() => {
          const found = mockSpaces.find((s) => s.id === id);
          return of(found ?? mockSpaces[0]);
        }),
      );
  }

  /** Create a new booking. Returns the created BookingResponse or throws on 4xx. */
  createBooking(req: CreateBookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.baseUrl}/bookings`, req);
  }

  /** Fetch bookings for a specific user. Falls back to mock data when API is unreachable. */
  getBookingsByUser(userId: string): Observable<BookingResponse[]> {
    return this.http
      .get<BookingResponse[]>(`${this.baseUrl}/bookings`, { params: { userId } })
      .pipe(
        catchError(() => {
          return of(mockBookings.filter((b) => b.userId === userId));
        }),
      );
  }

  /** Cancel a booking by ID. */
  cancelBooking(id: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${this.baseUrl}/bookings/${id}/cancel`, {});
  }

  /** @deprecated Use getBookingsByUser. Kept for backward compatibility. */
  getBookings(): Observable<BookingResponse[]> {
    return this.getBookingsByUser(DEMO_USER_ID);
  }

  // ─── User API ──────────────────────────────────────────────────────────────

  /** Fetch all users (admin only). Falls back to mock data. */
  getUsers(): Observable<UserResponse[]> {
    return this.http
      .get<UserResponse[]>(`${this.baseUrl}/users`)
      .pipe(catchError(() => of(mockUsers)));
  }

  /** Fetch a single user by ID. Falls back to mock. */
  getUserById(id: string): Observable<UserResponse> {
    return this.http
      .get<UserResponse>(`${this.baseUrl}/users/${id}`)
      .pipe(catchError(() => of(mockUsers.find((u) => u.id === id) ?? mockUsers[0])));
  }

  // ─── Owner-scoped booking API ──────────────────────────────────────────────

  /** Fetch bookings for spaces owned by the given ownerId. Falls back to mock. */
  getBookingsByOwner(ownerId: string): Observable<BookingResponse[]> {
    return this.http
      .get<BookingResponse[]>(`${this.baseUrl}/bookings`, { params: { ownerId } })
      .pipe(catchError(() => of(mockBookings.filter((b) => b.ownerId === ownerId))));
  }

  // ─── Review API ───────────────────────────────────────────────────────────────

  /** GET /api/v1/spaces/:spaceId/reviews — public, returns summary + list. */
  getReviews(spaceId: string): Observable<SpaceReviewsSummary> {
    return this.http.get<SpaceReviewsSummary>(`${this.baseUrl}/spaces/${spaceId}/reviews`);
  }

  /** POST /api/v1/spaces/:spaceId/reviews — creates/updates review (auth required). */
  createReview(spaceId: string, request: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.baseUrl}/spaces/${spaceId}/reviews`, request);
  }

  // ─── Space management API ─────────────────────────────────────────────────

  /**
   * Toggle a space's active flag (owner/admin only).
   * Sends a PATCH-style PUT with only the active field.
   */
  updateSpaceActive(id: string, active: boolean): Observable<Space> {
    return this.http
      .put<Space>(`${this.baseUrl}/spaces/${id}`, { active })
      .pipe(catchError(() => {
        // Offline: return the mock space with the new active value.
        const mock = mockSpaces.find((s) => s.id === id);
        return of(mock ? { ...mock, active } : mockSpaces[0]);
      }));
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Apply the same filter logic on mock data so the UX works offline. */
  private applyMockFilter(filter: SpaceFilter): Space[] {
    return mockSpaces.filter((s) => {
      if (filter.ownerId && s.ownerId !== filter.ownerId) return false;
      if (filter.city && !s.address.city.toLowerCase().includes(filter.city.toLowerCase())) return false;
      if (filter.type && s.type !== filter.type) return false;
      if (filter.amenity) {
        const needle = filter.amenity.toLowerCase();
        if (!s.amenities.some((a) => a.toLowerCase().includes(needle))) return false;
      }
      if (filter.minPrice != null && s.priceHourly < filter.minPrice) return false;
      if (filter.maxPrice != null && s.priceHourly > filter.maxPrice) return false;
      return true;
    });
  }
}

// ─── Display helpers (pure functions, reused across components) ───────────────

/** Convert a SpaceType enum value to a human-readable label. */
export function spaceTypeLabel(type: SpaceType): string {
  const map: Record<SpaceType, string> = {
    HOT_DESK: 'Hot Desk',
    DEDICATED_DESK: 'Dedicated Desk',
    PRIVATE_OFFICE: 'Private Office',
    MEETING_ROOM: 'Meeting Room',
  };
  return map[type] ?? type;
}

/** Format a cents integer as a dollar string: 4200 -> '$42.00' */
export function centsToDisplay(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}
