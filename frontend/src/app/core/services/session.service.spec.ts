import { TestBed } from '@angular/core/testing';
import { SessionService, DEMO_SESSIONS } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
    service.switchRole('CUSTOMER');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with the CUSTOMER demo session', () => {
    expect(service.role()).toBe('CUSTOMER');
    expect(service.userId()).toBe('user-demo');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('switchRole(OWNER) should update role and userId', () => {
    service.switchRole('OWNER');
    expect(service.role()).toBe('OWNER');
    expect(service.userId()).toBe(DEMO_SESSIONS['OWNER'].id);
  });

  it('switchRole(ADMIN) should set role to ADMIN', () => {
    service.switchRole('ADMIN');
    expect(service.role()).toBe('ADMIN');
  });

  it('displayName should reflect the current session user', () => {
    service.switchRole('OWNER');
    expect(service.displayName()).toContain('Sam');
  });

  it('clearSession() should set session to null', () => {
    service.clearSession();
    expect(service.session()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.role()).toBeNull();
    expect(service.userId()).toBeNull();
  });

  it('setSession() should override the current session', () => {
    service.setSession({
      id: 'custom-id',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    });
    expect(service.userId()).toBe('custom-id');
    expect(service.role()).toBe('ADMIN');
  });
});
