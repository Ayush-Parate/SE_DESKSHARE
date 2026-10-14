import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { DeskshareApiService, Space } from '../../core/services/deskshare-api.service';
import { HomeComponent } from './home';

const mockSpaces: Space[] = [
  {
    id: 's-101',
    ownerId: 'o-1',
    name: 'Harbor Desk',
    description: 'A bright open coworking floor.',
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
  },
  {
    id: 's-102',
    ownerId: 'o-2',
    name: 'North Studio',
    description: 'Fully private office in Austin.',
    address: { street: '250 Congress Ave', city: 'Austin', state: 'TX', postalCode: '78701', country: 'US' },
    longitude: null,
    latitude: null,
    type: 'PRIVATE_OFFICE',
    totalCapacity: 4,
    priceHourly: 2000,
    priceDaily: 14000,
    amenities: ['WiFi', 'Kitchen'],
    imageUrls: [],
    active: true,
    createdAt: '2026-10-02T00:00:00Z',
  },
];

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let apiSpy: jasmine.SpyObj<DeskshareApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('DeskshareApiService', ['getSpaces']);
    apiSpy.getSpaces.and.returnValue(of(mockSpaces));

    await TestBed.configureTestingModule({
      imports: [HomeComponent, NoopAnimationsModule],
      providers: [
        { provide: DeskshareApiService, useValue: apiSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the DeskShare hero headline', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Find the right workday setup');
  });

  it('should show featured space names from the API', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Harbor Desk');
    expect(el.textContent).toContain('North Studio');
  });

  it('should render Browse spaces CTA button', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    expect(buttons.some((b) => b.textContent?.includes('Browse spaces'))).toBeTrue();
  });

  it('should render See details buttons for each featured space', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const detailBtns = buttons.filter((b) => b.textContent?.includes('See details'));
    expect(detailBtns.length).toBe(mockSpaces.length);
  });

  it('should display the type label for each space', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Hot Desk');
    expect(el.textContent).toContain('Private Office');
  });
});
