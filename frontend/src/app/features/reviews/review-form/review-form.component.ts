import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SessionService } from '../../../core/services/session.service';
import { DeskshareApiService, CreateReviewRequest } from '../../../core/services/deskshare-api.service';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.scss',
})
export class ReviewFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(DeskshareApiService);
  private readonly session = inject(SessionService);
  private readonly snackBar = inject(MatSnackBar);

  /** Space ID to submit review for. */
  spaceId = input.required<string>();

  /** Emitted when a review is successfully submitted. */
  reviewSubmitted = output<void>();

  /** Emitted when the form is cancelled (user not logged in). */
  loginRequired = output<void>();

  reviewForm: FormGroup;
  submitting = false;
  selectedRating = 0;
  hoverRating = 0;

  constructor() {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  /** Whether the user is logged in (has a real JWT, not demo token). */
  isAuthenticated = computed(() => this.session.isLoggedIn() && !this.session.token()?.startsWith('demo-token-'));

  /** Whether the user has already submitted a review (we check this via the list). */
  hasExistingReview = input<boolean>(false);

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  onStarHover(rating: number): void {
    this.hoverRating = rating;
  }

  onStarLeave(): void {
    this.hoverRating = 0;
  }

  getDisplayRating(): number {
    return this.hoverRating || this.selectedRating;
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    if (!this.isAuthenticated()) {
      this.loginRequired.emit();
      return;
    }

    this.submitting = true;
    const { rating, comment } = this.reviewForm.value;

    this.api.createReview(this.spaceId(), { rating, comment }).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Review submitted!', 'Close', { duration: 3000 });
        this.reviewForm.reset({ rating: 0, comment: '' });
        this.selectedRating = 0;
        this.reviewSubmitted.emit();
      },
      error: (err) => {
        this.submitting = false;
        const message = err.error?.message || 'Failed to submit review. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 5000, panelClass: 'error-snackbar' });
      },
    });
  }

  get ratingControl() {
    return this.reviewForm.get('rating');
  }

  get commentControl() {
    return this.reviewForm.get('comment');
  }
}