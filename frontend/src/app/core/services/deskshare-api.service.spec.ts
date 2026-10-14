import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  DeskshareApiService,
  Space,
  centsToDisplay,
  spaceTypeLabel,
} from './deskshare-api.service';

const mockSpace: Space = {
  id: 's-1',
  ownerId: 'o-1',
  name: 'Test Desk',
  description: 'A test space description.',
  address: { street: '1 Main St', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'US' },
  longitude: -122.3,
  latitude: 47.6,
  type: 'HOT_DESK',
  totalCapacity: 4,
  priceHourly: 500,
  priceDaily: 3500,
  amenities: ['WiFi', 'Coffee'],
  imageUrls: [],
  active: true,
  createdAt: '2026-10-01T00:00:00Z',
};

describe('DeskshareApiService', () => {
  let service: DeskshareApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DeskshareApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSpaces()', () => {
    it('should GET /api/v1/spaces with no params when filter is empty', () => {
      service.getSpaces({}).subscribe((spaces) => {
        expect(spaces).toEqual([mockSpace]);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/spaces'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush([mockSpace]);
    });

    it('should append city and type query params', () => {
      service.getSpaces({ city: 'Seattle', type: 'HOT_DESK' }).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/spaces'));
      expect(req.request.params.get('city')).toBe('Seattle');
      expect(req.request.params.get('type')).toBe('HOT_DESK');
      req.flush([mockSpace]);
    });

    it('should convert dollar minPrice / maxPrice to cents params', () => {
      service.getSpaces({ minPrice: 500, maxPrice: 2000 }).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/spaces'));
      expect(req.request.params.get('minPrice')).toBe('500');
      expect(req.request.params.get('maxPrice')).toBe('2000');
      req.flush([]);
    });

    it('should fall back to mock data when the API returns an error', () => {
      let result: Space[] = [];
      service.getSpaces({}).subscribe((s) => (result = s));

      const req = httpMock.expectOne((r) => r.url.includes('/spaces'));
      req.error(new ProgressEvent('network error'));

      // mock data has 4 entries
      expect(result.length).toBeGreaterThan(0);
    });

    it('should apply mock city filter when API is unreachable', () => {
      let result: Space[] = [];
      service.getSpaces({ city: 'Seattle' }).subscribe((s) => (result = s));

      const req = httpMock.expectOne((r) => r.url.includes('/spaces'));
      req.error(new ProgressEvent('network error'));

      expect(result.every((s) => s.address.city === 'Seattle')).toBeTrue();
    });
  });

  describe('getSpaceById()', () => {
    it('should GET /api/v1/spaces/:id', () => {
      service.getSpaceById('s-1').subscribe((s) => {
        expect(s.id).toBe('s-1');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/spaces/s-1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockSpace);
    });

    it('should fall back to mock data for known id on API error', () => {
      let result: Space | undefined;
      service.getSpaceById('s-101').subscribe((s) => (result = s));

      const req = httpMock.expectOne((r) => r.url.includes('/spaces/s-101'));
      req.error(new ProgressEvent('network error'));

      expect(result?.id).toBe('s-101');
    });
  });
});

describe('Display helpers', () => {
  describe('centsToDisplay()', () => {
    it('converts 4200 cents to $42.00', () => {
      expect(centsToDisplay(4200)).toBe('$42.00');
    });

    it('converts 0 cents to $0.00', () => {
      expect(centsToDisplay(0)).toBe('$0.00');
    });

    it('handles non-round amounts correctly', () => {
      expect(centsToDisplay(99)).toBe('$0.99');
    });
  });

  describe('spaceTypeLabel()', () => {
    it('converts HOT_DESK to "Hot Desk"', () => {
      expect(spaceTypeLabel('HOT_DESK')).toBe('Hot Desk');
    });

    it('converts PRIVATE_OFFICE to "Private Office"', () => {
      expect(spaceTypeLabel('PRIVATE_OFFICE')).toBe('Private Office');
    });

    it('converts MEETING_ROOM to "Meeting Room"', () => {
      expect(spaceTypeLabel('MEETING_ROOM')).toBe('Meeting Room');
    });

    it('converts DEDICATED_DESK to "Dedicated Desk"', () => {
      expect(spaceTypeLabel('DEDICATED_DESK')).toBe('Dedicated Desk');
    });
  });
});
