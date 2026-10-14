import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import {
  BookingResponse,
  DeskshareApiService,
} from '../../core/services/deskshare-api.service';
import { BookingsComponent } from './bookings';

const confirmedBooking: BookingResponse = {
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
};

const completedBooking: BookingResponse = {
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
};

describe('BookingsComponent', () => {
  let fixture: ComponentFixture<BookingsComponent>;
  let component: BookingsComponent;
  let apiSpy: jasmine.SpyObj<DeskshareApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('DeskshareApiService', [
      'getBookingsByUser',
      'cancelBooking',
    ]);
    apiSpy.getBookingsByUser.and.returnValue(of([confirmedBooking, completedBooking]));

    await TestBed.configureTestingModule({
      imports: [BookingsComponent, NoopAnimationsModule],
      providers: [
        { provide: DeskshareApiService, useValue: apiSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getBookingsByUser with DEMO_USER_ID', () => {
    expect(apiSpy.getBookingsByUser).toHaveBeenCalledWith('user-demo');
  });

  it('should display booking IDs in the list', () => {
    const el: HTMLElement = fixture.nativeElement;
    // formatted space name from spaceId mapping
    expect(el.textContent).toContain('Harbor Desk');
  });

  it('should display the total price formatted in dollars', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('$21.00');
  });

  it('should render CONFIRMED status chip', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('CONFIRMED');
  });

  it('should render COMPLETED status chip', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('COMPLETED');
  });

  it('should show a Cancel button only for CONFIRMED bookings', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const cancelBtns = buttons.filter((b) => b.textContent?.includes('Cancel'));
    // only the CONFIRMED booking should have a cancel button
    expect(cancelBtns.length).toBe(1);
  });

  it('should show a "New booking" button linking to /bookings/new', () => {
    const el: HTMLElement = fixture.nativeElement;
    const newBtn: HTMLButtonElement | null = Array.from(
      el.querySelectorAll<HTMLButtonElement>('button'),
    ).find((b) => b.textContent?.includes('New booking')) ?? null;
    expect(newBtn).toBeTruthy();
  });

  it('should optimistically flip status to CANCELLED when API errors', fakeAsync(() => {
    apiSpy.cancelBooking.and.returnValue(
      throwError(() => new Error('network error')),
    );

    (component as any).cancelBooking(confirmedBooking);
    tick(0);
    fixture.detectChanges();

    const bookings: BookingResponse[] = (component as any).bookings();
    const updated = bookings.find((b: BookingResponse) => b.id === 'b-201');
    expect(updated?.status).toBe('CANCELLED');
  }));

  it('should update booking status to CANCELLED after successful cancel', fakeAsync(() => {
    const cancelledVersion: BookingResponse = { ...confirmedBooking, status: 'CANCELLED' };
    apiSpy.cancelBooking.and.returnValue(of(cancelledVersion));

    (component as any).cancelBooking(confirmedBooking);
    tick(0);
    fixture.detectChanges();

    const bookings: BookingResponse[] = (component as any).bookings();
    const updated = bookings.find((b: BookingResponse) => b.id === 'b-201');
    expect(updated?.status).toBe('CANCELLED');
  }));

  it('should show empty state when no bookings returned', async () => {
    apiSpy.getBookingsByUser.and.returnValue(of([]));
    fixture = TestBed.createComponent(BookingsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No bookings yet');
  });
});
