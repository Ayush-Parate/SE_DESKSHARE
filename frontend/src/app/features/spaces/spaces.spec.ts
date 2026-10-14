import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { DeskshareApiService, Space } from '../../core/services/deskshare-api.service';
import { SpacesComponent } from './spaces';

const mockSpaces: Space[] = [
  {
    id: 's-1',
    ownerId: 'o-1',
    name: 'Test Desk',
    description: 'Great coworking spot.',
    address: { street: '1 Main St', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'US' },
    longitude: null,
    latitude: null,
    type: 'HOT_DESK',
    totalCapacity: 5,
    priceHourly: 700,
    priceDaily: 4200,
    amenities: ['WiFi', 'Coffee'],
    imageUrls: [],
    active: true,
    createdAt: '2026-10-01T00:00:00Z',
  },
];

describe('SpacesComponent', () => {
  let component: SpacesComponent;
  let fixture: ComponentFixture<SpacesComponent>;
  let apiSpy: jasmine.SpyObj<DeskshareApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('DeskshareApiService', ['getSpaces']);
    apiSpy.getSpaces.and.returnValue(of(mockSpaces));

    await TestBed.configureTestingModule({
      imports: [SpacesComponent, NoopAnimationsModule],
      providers: [
        { provide: DeskshareApiService, useValue: apiSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the space name in a card title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test Desk');
  });

  it('should display the city', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Seattle');
  });

  it('should display the formatted hourly price', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('$7.00');
  });

  it('should call getSpaces again when filter changes', () => {
    const newFilter = { city: 'Austin' };
    // @ts-ignore — calling protected method for test
    component.onFilterChange(newFilter);
    expect(apiSpy.getSpaces).toHaveBeenCalledWith(newFilter);
  });

  it('should render a "View details" button for each space', () => {
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button');
    const viewDetailBtns = Array.from(buttons).filter((b) =>
      b.textContent?.includes('View details'),
    );
    expect(viewDetailBtns.length).toBe(mockSpaces.length);
  });

  it('should show empty state when no spaces returned', async () => {
    apiSpy.getSpaces.and.returnValue(of([]));
    // @ts-ignore
    component.onFilterChange({});
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No spaces match your filters');
  });
});
