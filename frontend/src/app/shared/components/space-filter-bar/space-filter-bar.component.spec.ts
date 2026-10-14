import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SpaceFilter } from '../../../core/services/deskshare-api.service';
import { SpaceFilterBarComponent } from './space-filter-bar.component';

describe('SpaceFilterBarComponent', () => {
  let component: SpaceFilterBarComponent;
  let fixture: ComponentFixture<SpaceFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceFilterBarComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SpaceFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render city, type, amenity inputs and min/max price fields', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('input[formcontrolname="city"]')).toBeTruthy();
    expect(compiled.querySelector('mat-select[formcontrolname="type"]')).toBeTruthy();
    expect(compiled.querySelector('input[formcontrolname="amenity"]')).toBeTruthy();
    expect(compiled.querySelector('input[formcontrolname="minPriceDisplay"]')).toBeTruthy();
    expect(compiled.querySelector('input[formcontrolname="maxPriceDisplay"]')).toBeTruthy();
  });

  it('should emit filterChange after debounce when city changes', fakeAsync(() => {
    let emitted: SpaceFilter | undefined;
    component.filterChange.subscribe((f) => (emitted = f));

    component.form.get('city')!.setValue('Austin');
    tick(400); // past the 300ms debounce

    expect(emitted).toBeDefined();
    expect(emitted!.city).toBe('Austin');
  }));

  it('should emit type in filter when type is selected', fakeAsync(() => {
    let emitted: SpaceFilter | undefined;
    component.filterChange.subscribe((f) => (emitted = f));

    component.form.get('type')!.setValue('PRIVATE_OFFICE');
    tick(400);

    expect(emitted!.type).toBe('PRIVATE_OFFICE');
  }));

  it('should convert dollar values to cents in the emitted filter', fakeAsync(() => {
    let emitted: SpaceFilter | undefined;
    component.filterChange.subscribe((f) => (emitted = f));

    component.form.get('minPriceDisplay')!.setValue(10);
    component.form.get('maxPriceDisplay')!.setValue(50);
    tick(400);

    expect(emitted!.minPrice).toBe(1000); // $10 → 1000 cents
    expect(emitted!.maxPrice).toBe(5000); // $50 → 5000 cents
  }));

  it('should not include type in filter when set to empty string', fakeAsync(() => {
    let emitted: SpaceFilter | undefined;
    component.filterChange.subscribe((f) => (emitted = f));

    component.form.get('type')!.setValue('');
    tick(400);

    expect(emitted!.type).toBeUndefined();
  }));

  it('clearAll() should reset the form and emit an empty filter', fakeAsync(() => {
    component.form.get('city')!.setValue('Seattle');
    tick(400);

    let emitted: SpaceFilter | undefined;
    component.filterChange.subscribe((f) => (emitted = f));

    component.clearAll();
    tick(400);

    expect(component.form.value.city).toBe('');
    expect(emitted).toEqual({});
  }));

  it('clearField() should clear only the specified field', fakeAsync(() => {
    component.form.get('city')!.setValue('Seattle');
    component.form.get('amenity')!.setValue('WiFi');
    tick(400);

    component.clearField('city');
    tick(400);

    expect(component.form.value.city).toBe('');
    expect(component.form.value.amenity).toBe('WiFi');
  }));
});
