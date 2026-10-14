import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { SpaceFilter, SpaceType } from '../../../core/services/deskshare-api.service';

export interface SpaceTypeOption {
  value: SpaceType | '';
  label: string;
}

@Component({
  selector: 'app-space-filter-bar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <form [formGroup]="form" class="filter-bar" aria-label="Filter spaces">
      <!-- City -->
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>City</mat-label>
        <input
          matInput
          formControlName="city"
          placeholder="e.g. Seattle"
          autocomplete="off"
          aria-label="Filter by city"
        />
        @if (form.value.city) {
          <button
            matSuffix
            mat-icon-button
            aria-label="Clear city"
            (click)="clearField('city')"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <!-- Space type -->
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Type</mat-label>
        <mat-select formControlName="type" aria-label="Filter by space type">
          @for (opt of typeOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <!-- Amenity -->
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Amenity</mat-label>
        <input
          matInput
          formControlName="amenity"
          placeholder="e.g. WiFi, Parking"
          autocomplete="off"
          aria-label="Filter by amenity"
        />
        @if (form.value.amenity) {
          <button
            matSuffix
            mat-icon-button
            aria-label="Clear amenity"
            (click)="clearField('amenity')"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <!-- Min hourly price -->
      <mat-form-field appearance="outline" class="filter-field filter-field--narrow">
        <mat-label>Min $/hr</mat-label>
        <input
          matInput
          type="number"
          min="0"
          formControlName="minPriceDisplay"
          placeholder="0"
          aria-label="Minimum hourly price in dollars"
        />
      </mat-form-field>

      <!-- Max hourly price -->
      <mat-form-field appearance="outline" class="filter-field filter-field--narrow">
        <mat-label>Max $/hr</mat-label>
        <input
          matInput
          type="number"
          min="0"
          formControlName="maxPriceDisplay"
          placeholder="Any"
          aria-label="Maximum hourly price in dollars"
        />
      </mat-form-field>

      <!-- Clear all -->
      <button
        mat-stroked-button
        type="button"
        class="clear-btn"
        aria-label="Clear all filters"
        (click)="clearAll()"
      >
        <mat-icon>filter_list_off</mat-icon>
        Clear
      </button>
    </form>
  `,
  styles: [
    `
      .filter-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: var(--mat-sys-surface-container-low, #f5f8ff);
        border-radius: 14px;
        margin-bottom: 1.5rem;
      }

      .filter-field {
        flex: 1 1 160px;
        min-width: 140px;
      }

      .filter-field--narrow {
        flex: 0 1 110px;
        min-width: 90px;
      }

      .clear-btn {
        height: 56px;
        white-space: nowrap;
      }

      /* Tighten the mat-form-field bottom padding in the filter bar */
      :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
    `,
  ],
})
export class SpaceFilterBarComponent implements OnInit, OnDestroy {
  /** Emitted whenever any filter changes (debounced 300 ms). */
  @Output() filterChange = new EventEmitter<SpaceFilter>();

  readonly typeOptions: SpaceTypeOption[] = [
    { value: '', label: 'All types' },
    { value: 'HOT_DESK', label: 'Hot Desk' },
    { value: 'DEDICATED_DESK', label: 'Dedicated Desk' },
    { value: 'PRIVATE_OFFICE', label: 'Private Office' },
    { value: 'MEETING_ROOM', label: 'Meeting Room' },
  ];

  form!: FormGroup;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      city: [''],
      type: [''],
      amenity: [''],
      minPriceDisplay: [null],
      maxPriceDisplay: [null],
    });

    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.emit());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearField(field: string): void {
    this.form.get(field)?.setValue('');
  }

  clearAll(): void {
    this.form.reset({ city: '', type: '', amenity: '', minPriceDisplay: null, maxPriceDisplay: null });
  }

  private emit(): void {
    const v = this.form.value;
    const filter: SpaceFilter = {};
    if (v.city?.trim()) filter.city = v.city.trim();
    if (v.type) filter.type = v.type as SpaceType;
    if (v.amenity?.trim()) filter.amenity = v.amenity.trim();
    // Convert display dollars → cents for the API
    if (v.minPriceDisplay != null && v.minPriceDisplay !== '') {
      filter.minPrice = Math.round(Number(v.minPriceDisplay) * 100);
    }
    if (v.maxPriceDisplay != null && v.maxPriceDisplay !== '') {
      filter.maxPrice = Math.round(Number(v.maxPriceDisplay) * 100);
    }
    this.filterChange.emit(filter);
  }
}
