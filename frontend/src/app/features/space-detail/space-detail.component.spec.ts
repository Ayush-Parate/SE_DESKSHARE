import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { DeskshareApiService, Space, SpaceReviewsSummary } from '../../core/services/deskshare-api.service';
import { SessionService } from '../../core/services/session.service';
import { SpaceDetailComponent } from './space-detail.component';

const mockSpace: Space = {
  id: 's-101',
  ownerId: 'owner-1',
  name: 'Harbor Desk',
  description: 'A bright open coworking floor in Seattle.',
  address: { street: '101 Harbor Ave', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'US' },
  longitude: -122.3365,
  latitude: 47.6062,
  type: 'HOT_DESK',
  totalCapacity: 8,
  priceHourly: 700,
  priceDaily: 4200,
  amenities: ['WiFi', 'Coffee', 'Standing Desks'],
  imageUrls: [],
  active: true,
  createdAt: '2026-10-01T08:00:00Z',
};

const mockReviewsSummary: SpaceReviewsSummary = {
  spaceId: 's-101',
  averageRating: 4.5,
  reviewCount: 2,
  reviews: [
    {
      id: 'r-1',
      spaceId: 's-101',
      userId: 'user-1',
      authorName: 'John Doe',
      rating: 5,
      comment: 'Great space!',
      createdAt: '2026-10-10T10:00:00Z',
    },
    {
      id: 'r-2',
      spaceId: 's-101',
      userId: 'user-2',
      authorName: 'Jane Smith',
      rating: 4,
      comment: 'Good value for money.',
      createdAt: '2026-10-09T14:00:00Z',
    },
  ],
};

describe('SpaceDetailComponent', () => {
  let component: SpaceDetailComponent;
  let fixture: ComponentFixture<SpaceDetailComponent>;
  let apiSpy: jasmine.SpyObj<DeskshareApiService>;
  let sessionSpy: jasmine.SpyObj<SessionService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('DeskshareApiService', ['getSpaceById', 'getReviews']);
    apiSpy.getSpaceById.and.returnValue(of(mockSpace));
    apiSpy.getReviews.and.returnValue(of(mockReviewsSummary));

    sessionSpy = jasmine.createSpyObj('SessionService', ['userId']);
    sessionSpy.userId.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [SpaceDetailComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: DeskshareApiService, useValue: apiSpy },
        { provide: SessionService, useValue: sessionSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 's-101' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpaceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getSpaceById with the route id', () => {
    expect(apiSpy.getSpaceById).toHaveBeenCalledWith('s-101');
  });

  it('should call getReviews with the route id', () => {
    expect(apiSpy.getReviews).toHaveBeenCalledWith('s-101');
  });

  it('should display the space name', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Harbor Desk');
  });

  it('should display the city in the address', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Seattle');
  });

  it('should display the hourly price formatted in dollars', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('$7.00');
  });

  it('should display the daily price formatted in dollars', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('$42.00');
  });

  it('should display all amenities', () => {
    const el: HTMLElement = fixture.nativeElement;
    for (const amenity of mockSpace.amenities) {
      expect(el.textContent).toContain(amenity);
    }
  });

  it('should display the capacity', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('8 seats');
  });

  it('should render a Book Now button', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    expect(buttons.some((b) => b.textContent?.includes('Book Now'))).toBeTrue();
  });

  it('should render a back nav link to /spaces', () => {
    const el: HTMLElement = fixture.nativeElement;
    const backLink = el.querySelector('a[href="/spaces"]');
    expect(backLink).toBeTruthy();
  });
});