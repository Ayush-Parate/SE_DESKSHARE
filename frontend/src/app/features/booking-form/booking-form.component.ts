import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  BookingResponse,
  DEMO_USER_ID,
  DeskshareApiService,
  Space,
  centsToDisplay,
  spaceTypeLabel,
} from '../../core/services/deskshare-api.service';

/** Hour options for the time selects (0–23). */
const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, '0') + ':00',
}));

/** Cross-field validator: endHour must be strictly after startHour. */
function endAfterStartValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startHour')?.value;
  const end = group.get('endHour')?.value;
  if (start != null && end != null && end <= start) {
    return { endNotAfterStart: true };
  }
  return null;
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  template: `
    <!-- Back nav -->
    <nav class="back-nav" aria-label="Breadcrumb">
      <a mat-button routerLink="/spaces" aria-label="Back to spaces">
        <mat-icon>arrow_back</mat-icon>
        All spaces
      </a>
    </nav>

    <!-- Page header -->
    <section class="page-header">
      <p class="eyebrow">New Reservation</p>
      <h2>Book a space</h2>
    </section>

    <!-- Loading space info -->
    @if (loadingSpace()) {
      <div class="state-centered">
        <mat-spinner diameter="44" />
        <p>Loading space details…</p>
      </div>
    }

    <!-- Success confirmation -->
    @if (confirmed(); as booking) {
      <div class="confirmation-card" role="status" aria-live="polite">
        <div class="confirmation-icon">
          <mat-icon>check_circle</mat-icon>
        </div>
        <h3>Booking confirmed!</h3>
        <p class="conf-sub">Your reservation has been created successfully.</p>

        <div class="conf-grid">
          <div class="conf-item">
            <span class="conf-label">Booking ID</span>
            <code>{{ booking.id }}</code>
          </div>
          <div class="conf-item">
            <span class="conf-label">Space</span>
            <strong>{{ space()?.name ?? booking.spaceId }}</strong>
          </div>
          <div class="conf-item">
            <span class="conf-label">Window</span>
            <strong>{{ formatInstant(booking.startTime) }} – {{ formatInstant(booking.endTime) }}</strong>
          </div>
          <div class="conf-item">
            <span class="conf-label">Seats</span>
            <strong>{{ booking.slotCount }}</strong>
          </div>
          <div class="conf-item">
            <span class="conf-label">Total</span>
            <strong class="price">{{ displayPrice(booking.totalPrice) }}</strong>
          </div>
          <div class="conf-item">
            <span class="conf-label">Status</span>
            <mat-chip class="status-chip status-confirmed">{{ booking.status }}</mat-chip>
          </div>
          @if (booking.notes) {
            <div class="conf-item conf-item--full">
              <span class="conf-label">Notes</span>
              <span>{{ booking.notes }}</span>
            </div>
          }
        </div>

        <div class="conf-actions">
          <button mat-flat-button color="primary" routerLink="/bookings">
            <mat-icon>event_note</mat-icon>
            View my bookings
          </button>
          <button mat-stroked-button routerLink="/spaces">
            Browse more spaces
          </button>
        </div>
      </div>
    }

    <!-- Booking form -->
    @if (!loadingSpace() && !confirmed()) {
      <div class="form-layout">

        <!-- Space summary sidebar -->
        @if (space(); as sp) {
          <aside class="space-summary" aria-label="Space being booked">
            <div class="type-chip-wrap">
              <mat-chip [highlighted]="true" class="type-chip">
                {{ typeLabel(sp.type) }}
              </mat-chip>
            </div>
            <h3>{{ sp.name }}</h3>
            <p class="location">
              <mat-icon class="pin-icon" aria-hidden="true">location_on</mat-icon>
              {{ sp.address.city }}, {{ sp.address.state }}
            </p>
            <div class="rate-row">
              <span class="rate-amount">{{ displayPrice(sp.priceHourly) }}</span>
              <span class="rate-unit">/ hour / seat</span>
            </div>
            <div class="capacity-row">
              <mat-icon aria-hidden="true">group</mat-icon>
              <span>Max <strong>{{ sp.totalCapacity }}</strong> seats</span>
            </div>
          </aside>
        }

        <!-- Form card -->
        <mat-card class="form-card">
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate aria-label="Booking form">

              <!-- Date -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="datePicker"
                  formControlName="date"
                  placeholder="Select a date"
                  readonly
                  aria-required="true"
                />
                <mat-datepicker-toggle matSuffix [for]="datePicker" />
                <mat-datepicker #datePicker />
                @if (form.get('date')?.invalid && form.get('date')?.touched) {
                  <mat-error>Please select a date.</mat-error>
                }
              </mat-form-field>

              <!-- Start / End hour row -->
              <div class="time-row" [class.time-row--error]="form.hasError('endNotAfterStart')">
                <mat-form-field appearance="outline" class="time-field">
                  <mat-label>Start time</mat-label>
                  <mat-select formControlName="startHour" aria-required="true" aria-label="Start hour">
                    @for (h of hours; track h.value) {
                      <mat-option [value]="h.value">{{ h.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <span class="time-sep" aria-hidden="true">to</span>

                <mat-form-field appearance="outline" class="time-field">
                  <mat-label>End time</mat-label>
                  <mat-select formControlName="endHour" aria-required="true" aria-label="End hour">
                    @for (h of hours; track h.value) {
                      <mat-option [value]="h.value">{{ h.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
              @if (form.hasError('endNotAfterStart') && (form.get('startHour')?.touched || form.get('endHour')?.touched)) {
                <p class="cross-field-error" role="alert">End time must be after start time.</p>
              }

              <!-- Slot count -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Number of seats</mat-label>
                <input
                  matInput
                  type="number"
                  min="1"
                  [max]="space()?.totalCapacity ?? 99"
                  formControlName="slotCount"
                  aria-required="true"
                />
                @if (form.get('slotCount')?.hasError('required') && form.get('slotCount')?.touched) {
                  <mat-error>Seat count is required.</mat-error>
                }
                @if (form.get('slotCount')?.hasError('min') && form.get('slotCount')?.touched) {
                  <mat-error>At least 1 seat required.</mat-error>
                }
                @if (form.get('slotCount')?.hasError('max') && form.get('slotCount')?.touched) {
                  <mat-error>Exceeds space capacity of {{ space()?.totalCapacity }} seats.</mat-error>
                }
              </mat-form-field>

              <!-- Notes -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes (optional)</mat-label>
                <textarea
                  matInput
                  formControlName="notes"
                  rows="3"
                  placeholder="Any special requirements?"
                  aria-label="Optional notes"
                ></textarea>
              </mat-form-field>

              <!-- Live price preview -->
              @if (pricePreview() !== null) {
                <div class="price-preview" role="status" aria-live="polite" aria-label="Estimated total">
                  <div class="price-preview-label">Estimated total</div>
                  <div class="price-preview-amount">{{ displayPrice(pricePreview()!) }}</div>
                  <div class="price-preview-breakdown">
                    {{ durationHours() }}h &times; {{ displayPrice(space()?.priceHourly ?? 0) }}/hr
                    &times; {{ form.value.slotCount }} seat{{ form.value.slotCount === 1 ? '' : 's' }}
                  </div>
                </div>
              }

              <!-- Error banner -->
              @if (errorMessage()) {
                <div class="error-banner" role="alert" aria-live="assertive">
                  <mat-icon>error_outline</mat-icon>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <!-- Submit row -->
              <div class="submit-row">
                <button
                  mat-flat-button
                  color="primary"
                  type="submit"
                  [disabled]="form.invalid || submitting()"
                  aria-label="Confirm booking"
                >
                  @if (submitting()) {
                    <mat-spinner diameter="20" />
                  } @else {
                    <ng-container>
                      <mat-icon>event_available</mat-icon>
                      Confirm booking
                    </ng-container>
                  }
                </button>
                <button mat-stroked-button type="button" routerLink="/spaces">
                  Cancel
                </button>
              </div>

            </form>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [
    `
      :host { display: block; }

      /* Back nav */
      .back-nav { margin-bottom: 1.25rem; }
      .back-nav a { display: inline-flex; align-items: center; gap: 0.3rem; color: rgba(0,0,0,0.6); }

      /* Page header */
      .page-header { margin-bottom: 1.5rem; }
      .eyebrow {
        text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.74rem;
        font-weight: 700; color: #1e88e5; margin: 0 0 0.4rem;
      }
      h2 { margin: 0; }

      /* Centered states */
      .state-centered {
        display: flex; flex-direction: column; align-items: center;
        gap: 0.75rem; padding: 4rem 1rem; text-align: center; color: rgba(0,0,0,0.55);
      }

      /* ── Form layout ── */
      .form-layout {
        display: flex;
        gap: 2rem;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      /* Space summary sidebar */
      .space-summary {
        flex: 0 0 220px;
        background: var(--mat-sys-surface-container-low, #f5f8ff);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .type-chip-wrap { display: flex; }
      .type-chip { font-size: 0.74rem; font-weight: 600; pointer-events: none; }
      .space-summary h3 { margin: 0; font-size: 1.1rem; }
      .location { display: flex; align-items: center; gap: 0.2rem; color: rgba(0,0,0,0.6); font-size: 0.9rem; margin: 0; }
      .pin-icon { font-size: 1rem; width: 1rem; height: 1rem; }
      .rate-row { display: flex; align-items: baseline; gap: 0.3rem; }
      .rate-amount { font-size: 1.4rem; font-weight: 700; color: #0d47a1; }
      .rate-unit { font-size: 0.82rem; color: rgba(0,0,0,0.55); }
      .capacity-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; color: rgba(0,0,0,0.7); }

      /* Form card */
      .form-card {
        flex: 1 1 400px;
        border-radius: 16px;
      }

      .full-width { width: 100%; margin-bottom: 0.25rem; }

      /* Time row */
      .time-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.25rem;
      }
      .time-row--error .time-field ::ng-deep .mdc-notched-outline__notch { border-color: #d32f2f; }
      .time-field { flex: 1; }
      .time-sep { color: rgba(0,0,0,0.5); font-size: 0.9rem; white-space: nowrap; }
      .cross-field-error { color: #d32f2f; font-size: 0.75rem; margin: -0.5rem 0 0.5rem 0.9rem; }

      /* Price preview */
      .price-preview {
        background: #e3f2fd;
        border-radius: 12px;
        padding: 1rem 1.25rem;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .price-preview-label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(0,0,0,0.55); }
      .price-preview-amount { font-size: 1.6rem; font-weight: 700; color: #0d47a1; }
      .price-preview-breakdown { font-size: 0.82rem; color: rgba(0,0,0,0.6); }

      /* Error banner */
      .error-banner {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        background: #ffebee;
        color: #c62828;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      /* Submit row */
      .submit-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 0.5rem;
      }

      /* ── Confirmation ── */
      .confirmation-card {
        background: var(--mat-sys-surface-container-low, #f5f8ff);
        border-radius: 20px;
        padding: 2.5rem 2rem;
        max-width: 560px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .confirmation-icon mat-icon {
        font-size: 3.5rem; width: 3.5rem; height: 3.5rem; color: #2e7d32;
      }
      .confirmation-card h3 { margin: 0; font-size: 1.6rem; }
      .conf-sub { margin: 0; color: rgba(0,0,0,0.6); }

      .conf-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem 1.5rem;
        margin: 0.5rem 0;
      }
      .conf-item { display: flex; flex-direction: column; gap: 0.15rem; }
      .conf-item--full { grid-column: 1 / -1; }
      .conf-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(0,0,0,0.5); }
      code { background: rgba(0,0,0,0.06); border-radius: 4px; padding: 0.1rem 0.4rem; font-family: monospace; font-size: 0.8rem; }
      .price { color: #0d47a1; font-size: 1.1rem; }

      .status-chip { font-size: 0.72rem; font-weight: 600; pointer-events: none; }
      .status-confirmed { background: #e8f5e9; color: #1b5e20; }

      .conf-actions { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.5rem; }
    `,
  ],
})
export class BookingFormComponent implements OnInit {
  protected readonly space = signal<Space | null>(null);
  protected readonly loadingSpace = signal(false);
  protected readonly submitting = signal(false);
  protected readonly confirmed = signal<BookingResponse | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pricePreview = signal<number | null>(null);
  protected readonly durationHours = signal(0);

  readonly hours = HOURS;
  readonly today = new Date();

  form!: FormGroup;

  private spaceId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: DeskshareApiService,
  ) {}

  ngOnInit(): void {
    this.spaceId = this.route.snapshot.queryParamMap.get('spaceId');

    this.form = this.fb.group(
      {
        date: [null, Validators.required],
        startHour: [9, Validators.required],
        endHour: [10, Validators.required],
        slotCount: [1, [Validators.required, Validators.min(1)]],
        notes: [''],
      },
      { validators: endAfterStartValidator },
    );

    // Recompute price preview whenever relevant fields change.
    this.form.valueChanges.subscribe(() => this.updatePreview());

    if (this.spaceId) {
      this.loadingSpace.set(true);
      this.apiService.getSpaceById(this.spaceId).subscribe({
        next: (s) => {
          this.space.set(s);
          this.loadingSpace.set(false);
          // Apply max validator now that we know capacity.
          this.form
            .get('slotCount')!
            .setValidators([
              Validators.required,
              Validators.min(1),
              Validators.max(s.totalCapacity),
            ]);
          this.form.get('slotCount')!.updateValueAndValidity();
          this.updatePreview();
        },
        error: () => this.loadingSpace.set(false),
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    this.errorMessage.set(null);
    this.submitting.set(true);

    const { date, startHour, endHour, slotCount, notes } = this.form.value;

    // Build UTC ISO-8601 Instants from the local date + hour selections.
    const startTime = this.buildInstant(date as Date, startHour as number);
    const endTime = this.buildInstant(date as Date, endHour as number);

    const req = {
      userId: DEMO_USER_ID,
      spaceId: this.spaceId ?? '',
      startTime,
      endTime,
      slotCount: Number(slotCount),
      notes: notes?.trim() || undefined,
    };

    this.apiService.createBooking(req).subscribe({
      next: (booking) => {
        this.submitting.set(false);
        this.confirmed.set(booking);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        if (err.status === 0) {
          // Backend unreachable — produce a mock confirmation so the demo still works.
          const mockConfirm: BookingResponse = {
            id: 'b-demo-' + Date.now(),
            userId: req.userId,
            spaceId: req.spaceId,
            ownerId: this.space()?.ownerId ?? 'owner-demo',
            startTime: req.startTime,
            endTime: req.endTime,
            slotCount: req.slotCount,
            totalPrice: this.pricePreview() ?? 0,
            currency: 'USD',
            status: 'CONFIRMED',
            notes: req.notes ?? null,
            createdAt: new Date().toISOString(),
          };
          this.confirmed.set(mockConfirm);
          return;
        }
        this.errorMessage.set(this.extractError(err));
      },
    });
  }

  protected displayPrice(cents: number): string {
    return centsToDisplay(cents);
  }

  protected typeLabel(type: Space['type']): string {
    return spaceTypeLabel(type);
  }

  protected formatInstant(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private updatePreview(): void {
    const sp = this.space();
    if (!sp) { this.pricePreview.set(null); return; }

    const { date, startHour, endHour, slotCount } = this.form.value;
    if (!date || startHour == null || endHour == null || endHour <= startHour || slotCount < 1) {
      this.pricePreview.set(null);
      return;
    }

    const hours = endHour - startHour;
    this.durationHours.set(hours);
    this.pricePreview.set(hours * sp.priceHourly * Number(slotCount));
  }

  /** Build an ISO-8601 string for the given local date at the given hour (UTC). */
  private buildInstant(date: Date, hour: number): string {
    const d = new Date(date);
    d.setUTCHours(hour, 0, 0, 0);
    return d.toISOString();
  }

  private extractError(err: HttpErrorResponse): string {
    if (err.status === 409) {
      const msg = err.error?.message ?? err.error?.error;
      return msg
        ? `No availability: ${msg}`
        : 'No slots available for the selected time window. Please choose a different time.';
    }
    if (err.status === 400) {
      const msg = err.error?.message ?? err.error?.error;
      return msg ? `Validation error: ${msg}` : 'Please check your inputs and try again.';
    }
    return `Something went wrong (${err.status}). Please try again.`;
  }
}
