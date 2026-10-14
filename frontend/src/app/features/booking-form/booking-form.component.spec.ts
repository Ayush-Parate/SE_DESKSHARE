import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import {
  BookingResponse,
  DeskshareApiService,
  Space,
} from '../../core/services/deskshare-api.service';
import { BookingFormComponent } from './booking-form.component';

const mockSpace: Space = {
  id: 's-101',
  ownerId: 'owner-1',
  name: 'Harbor Desk',
  description: 'A coworking floor in Seattle.',
  address: { street: '101 Harbor Ave', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'US' },
  longitude: null,
  latitude: null,
  type: 'HOT_DESK',
  totalCapacity: 8,
  priceHourly: 700,
  priceDaily: 4200,
  amenities: ['WiFi'],
  imageUrls: [],
  active: true,
  createdAt: '2026-10-01T00:00:00Z',
};

const mockBookingResponse: BookingResponse = {
  id: 'b-new-1',
  userId: 'user-demo',
  spaceId: 's-101',
  ownerId: 'owner-1',
  startTime: '2026-11-01T09:00:00Z',
  endTime: '2026-11-01T11:00:00Z',
  slotCount: 1,
  totalPrice: 1400,
  currency: 'USD',
  status: 'CONFIRMED',
  notes: null,
  createdAt: '2026-10-14T10:00:00Z',
};

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;
  let apiSpy: jasmine.SpyObj<DeskshareApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('DeskshareApiService', [
      'getSpaceById',
      'createBooking',
    ]);
    apiSpy.getSpaceById.and.returnValue(of(mockSpace));
    apiSpy.createBooking.and.returnValue(of(mockBookingResponse));

    await TestBed.configureTestingModule({
      imports: [BookingFormComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: DeskshareApiService, useValue: apiSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => 's-101' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getSpaceById with the query param spaceId', () => {
    expect(apiSpy.getSpaceById).toHaveBeenCalledWith('s-101');
  });

  it('should display the space name in the sidebar', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Harbor Desk');
  });

  it('should show the hourly rate in the sidebar', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('$7.00');
  });

  it('should render the seat-count input', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[formcontrolname="slotCount"]')).toBeTruthy();
  });

  it('should render the notes textarea', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('textarea[formcontrolname="notes"]')).toBeTruthy();
  });

  it('form should be invalid when date is not set', () => {
    component.form.get('date')!.setValue(null);
    component.form.get('date')!.markAsTouched();
    expect(component.form.invalid).toBeTrue();
  });

  it('submit button should be disabled when form is invalid', () => {
    component.form.get('date')!.setValue(null);
    fixture.detectChanges();
    const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    expect(btn?.disabled).toBeTrue();
  });

  it('should compute price preview as hours * priceHourly * slotCount', fakeAsync(() => {
    component.form.patchValue({
      date: new Date('2026-11-01'),
      startHour: 9,
      endHour: 11,
      slotCount: 1,
    });
    tick(0);
    fixture.detectChanges();

    // 2h * $7.00/hr * 1 seat = $14.00
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('$14.00');
  }));

  it('should show confirmation card after successful submit', fakeAsync(() => {
    component.form.patchValue({
      date: new Date('2026-11-01'),
      startHour: 9,
      endHour: 11,
      slotCount: 1,
    });
    fixture.detectChanges();

    (component as any).onSubmit();
    tick(0);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Booking confirmed');
    expect(el.textContent).toContain('b-new-1');
  }));

  it('should show 409 error banner on conflict', fakeAsync(() => {
    const conflictErr = new HttpErrorResponse({
      status: 409,
      error: { message: 'No capacity left at 09:00' },
    });
    apiSpy.createBooking.and.returnValue(throwError(() => conflictErr));

    component.form.patchValue({
      date: new Date('2026-11-01'),
      startHour: 9,
      endHour: 11,
      slotCount: 1,
    });
    fixture.detectChanges();

    (component as any).onSubmit();
    tick(0);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No availability');
  }));

  it('should show a generic error banner on 500', fakeAsync(() => {
    apiSpy.createBooking.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    component.form.patchValue({
      date: new Date('2026-11-01'),
      startHour: 9,
      endHour: 11,
      slotCount: 1,
    });
    fixture.detectChanges();

    (component as any).onSubmit();
    tick(0);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Something went wrong');
  }));

  it('should produce mock confirmation on network error (status 0)', fakeAsync(() => {
    apiSpy.createBooking.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 0 })),
    );

    component.form.patchValue({
      date: new Date('2026-11-01'),
      startHour: 9,
      endHour: 11,
      slotCount: 1,
    });
    fixture.detectChanges();

    (component as any).onSubmit();
    tick(0);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Booking confirmed');
  }));
});
