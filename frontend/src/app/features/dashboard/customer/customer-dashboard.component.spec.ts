import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BookingResponse, DeskshareApiService } from '../../../core/services/deskshare-api.service';
import { SessionService } from '../../../core/services/session.service';
import { CustomerDashboardComponent } from './customer-dashboard.component';

const future = new Date(Date.now() + 86_400_000).toISOString(); // +1 day
const past   = new Date(Date.now() - 86_400_000).toISOString(); // -1 day

const confirmedFuture: BookingResponse = {
  id: 'b-1', userId: 'user-demo', spaceId: 's-101', ownerId: 'owner-1',
  startTime: future, endTime: new Date(Date.now() + 90_000_000).toISOString(),
  slotCount: 1, totalPrice: 700, currency: 'USD', status: 'CONFIRMED',
  notes: null, createdAt: new Date().toISOString(),
};

const completedPast: BookingResponse = {
  id: 'b-2', userId: 'user-demo', spaceId: 's-102', ownerId: 'owner-2',
  startTime: past, endTime: new Date(Date.now() - 80_000_000).toISOString(),
  slotCount: 2, totalPrice: 4000, currency: 'USD', status: 'COMPLETED',
  notes: null, createdAt: new Date().toISOString(),
};

describe('CustomerDashboardComponent', () => {
  let fixture: ComponentFixture<CustomerDashboardComponent>;
  let apiSpy: jasmine.SpyObj<DeskshareApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('DeskshareApiService', ['getBookingsByUser']);
    apiSpy.getBookingsByUser.and.returnValue(of([confirmedFuture, completedPast]));

    await TestBed.configureTestingModule({
      imports: [CustomerDashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: DeskshareApiService, useValue: apiSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    const session = TestBed.inject(SessionService);
    session.switchRole('CUSTOMER');

    fixture = TestBed.createComponent(CustomerDashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load bookings for the current user', () => {
    expect(apiSpy.getBookingsByUser).toHaveBeenCalledWith('user-demo');
  });

  it('should display upcoming count stat', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('1'); // 1 upcoming
  });

  it('should show total spend combining non-cancelled bookings', () => {
    // 700 + 4000 = 4700 cents = $47.00
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('$47.00');
  });

  it('should render a "Book again" button for past bookings', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    expect(buttons.some((b) => b.textContent?.includes('Book again'))).toBeTrue();
  });

  it('should show empty state for upcoming when no future bookings', async () => {
    apiSpy.getBookingsByUser.and.returnValue(of([completedPast]));
    fixture = TestBed.createComponent(CustomerDashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No upcoming bookings');
  });
});
