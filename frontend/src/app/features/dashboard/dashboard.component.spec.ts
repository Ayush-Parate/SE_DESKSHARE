import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DeskshareApiService } from '../../core/services/deskshare-api.service';
import { SessionService } from '../../core/services/session.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let sessionService: SessionService;
  let apiSpy: jasmine.SpyObj<DeskshareApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('DeskshareApiService', [
      'getBookingsByUser',
      'getBookingsByOwner',
      'getSpaces',
      'getUsers',
    ]);
    apiSpy.getBookingsByUser.and.returnValue(of([]));
    apiSpy.getBookingsByOwner.and.returnValue(of([]));
    apiSpy.getSpaces.and.returnValue(of([]));
    apiSpy.getUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: DeskshareApiService, useValue: apiSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render "Dashboard" heading', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Dashboard');
  });

  it('should show all three tab labels', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Customer');
    expect(el.textContent).toContain('Owner');
    expect(el.textContent).toContain('Admin');
  });

  it('should display the active role from SessionService', () => {
    sessionService.switchRole('CUSTOMER');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('CUSTOMER');
  });

  it('should update session role when tab index changes', () => {
    const component = fixture.componentInstance as any;
    component.onTabChange(1); // Owner tab
    expect(sessionService.role()).toBe('OWNER');
  });

  it('activeTabIndex should be 0 for CUSTOMER role', () => {
    sessionService.switchRole('CUSTOMER');
    fixture.detectChanges();
    const component = fixture.componentInstance as any;
    expect(component.activeTabIndex()).toBe(0);
  });

  it('activeTabIndex should be 2 for ADMIN role', () => {
    sessionService.switchRole('ADMIN');
    fixture.detectChanges();
    const component = fixture.componentInstance as any;
    expect(component.activeTabIndex()).toBe(2);
  });
});
