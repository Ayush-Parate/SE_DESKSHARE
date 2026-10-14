import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import {
  BookingResponse,
  DeskshareApiService,
  Space,
} from '../../../core/services/deskshare-api.service';
import { SessionService } from '../../../core/services/session.service';
import { OwnerDashboardComponent } from './owner-dashboard.component';

const mockSpace: Space = {
  id: 's-101', ownerId: 'owner-1', name: 'Harbor Desk',
  description: 'A space.', active: true, type: 'HOT_DESK',
  address: { street: '1 St', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'US' },
  longitude: null, latitude: null, totalCapacity: 8,
  priceHourly: 700, priceDaily: 4200, amenities: [], imageUrls: [],
  createdAt: '2026-10-01T00:00:00Z',
};

const mockBooking: BookingResponse = {
  id: 'b-1', userId: 'user-demo', spaceId: 's-101', ownerId: 'owner-1',
  startTime: '2026-10-18T09:00:00Z', endTime: '2026-10-18T12:00:00Z',
  slotCount: 1, totalPrice: 2100, currency: 'USD', status: 'CONFIRMED',
  notes: null, createdAt: '2026-10-14T00:00:00Z',
};

describe('OwnerDashboardComponent', () => {
  let fixture: ComponentFixture<OwnerDashboardComponent>;
  let apiSpy: jasmine.SpyObj<DeskshareApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('DeskshareApiService', [
      'getSpaces', 'getBookingsByOwner', 'updateSpaceActive',
    ]);
    apiSpy.getSpaces.and.returnValue(of([mockSpace]));
    apiSpy.getBookingsByOwner.and.returnValue(of([mockBooking]));
    apiSpy.updateSpaceActive.and.returnValue(of({ ...mockSpace, active: false }));

    await TestBed.configureTestingModule({
      imports: [OwnerDashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: DeskshareApiService, useValue: apiSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    // Switch to OWNER session
    const session = TestBed.inject(SessionService);
    session.switchRole('OWNER');

    fixture = TestBed.createComponent(OwnerDashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the space name', () => {
    expect(fixture.nativeElement.textContent).toContain('Harbor Desk');
  });

  it('should display total revenue from non-cancelled bookings', () => {
    // 2100 cents = $21.00
    expect(fixture.nativeElement.textContent).toContain('$21.00');
  });

  it('should call updateSpaceActive when toggle is changed', () => {
    const component = fixture.componentInstance as any;
    component.toggleActive(mockSpace);
    expect(apiSpy.updateSpaceActive).toHaveBeenCalledWith('s-101', false);
  });

  it('should render revenue for a specific space', () => {
    const component = fixture.componentInstance as any;
    const revenue = component.revenueForSpace('s-101');
    expect(revenue).toBe('$21.00');
  });
});
