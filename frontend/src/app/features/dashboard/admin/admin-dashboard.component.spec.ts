import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import {
  BookingResponse,
  DeskshareApiService,
  Space,
  UserResponse,
} from '../../../core/services/deskshare-api.service';
import { SessionService } from '../../../core/services/session.service';
import { AdminDashboardComponent } from './admin-dashboard.component';

const mockUser: UserResponse = {
  id: 'user-demo', email: 'customer@demo.deskshare', firstName: 'Alex', lastName: 'Customer',
  phone: null, role: 'CUSTOMER', active: true, createdAt: '2026-10-01T00:00:00Z',
};

const mockSpace: Space = {
  id: 's-101', ownerId: 'owner-1', name: 'Harbor Desk', description: 'A space.',
  active: true, type: 'HOT_DESK',
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

describe('AdminDashboardComponent', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let apiSpy: jasmine.SpyObj<DeskshareApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('DeskshareApiService', [
      'getUsers', 'getSpaces', 'getBookingsByUser',
    ]);
    apiSpy.getUsers.and.returnValue(of([mockUser]));
    apiSpy.getSpaces.and.returnValue(of([mockSpace]));
    apiSpy.getBookingsByUser.and.returnValue(of([mockBooking]));

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: DeskshareApiService, useValue: apiSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    const session = TestBed.inject(SessionService);
    session.switchRole('ADMIN');

    fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call getUsers, getSpaces and getBookingsByUser on init', () => {
    expect(apiSpy.getUsers).toHaveBeenCalled();
    expect(apiSpy.getSpaces).toHaveBeenCalled();
    expect(apiSpy.getBookingsByUser).toHaveBeenCalled();
  });

  it('should display stat counts', () => {
    const el: HTMLElement = fixture.nativeElement;
    // 1 user, 1 space, 1 booking
    const statValues = el.querySelectorAll('.stat-value');
    const texts = Array.from(statValues).map((e) => e.textContent?.trim());
    expect(texts).toContain('1');
  });

  it('should render three tab buttons', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.tab-btn');
    expect(tabs.length).toBe(3);
  });

  it('should start on the users tab', () => {
    const component = fixture.componentInstance as any;
    expect(component.activeTab()).toBe('users');
  });

  it('setTab() should switch to spaces tab', () => {
    const component = fixture.componentInstance as any;
    component.setTab('spaces');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('spaces');
  });

  it('should show the user table when users tab is active', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Alex');
    expect(el.textContent).toContain('Customer');
  });

  it('should show the spaces table when spaces tab is active', () => {
    const component = fixture.componentInstance as any;
    component.setTab('spaces');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Harbor Desk');
  });

  it('should compute platform revenue from non-cancelled bookings', () => {
    const component = fixture.componentInstance as any;
    // 2100 cents = $21.00
    expect(component.platformRevenue()).toBe('$21.00');
  });
});
