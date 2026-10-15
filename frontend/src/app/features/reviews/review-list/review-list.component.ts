import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SpaceReviewsSummary, ReviewResponse } from '../../../core/services/deskshare-api.service';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './review-list.component.html',
  styleUrl: './review-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewListComponent {
  /** The reviews summary data from the API. */
  summary = input<SpaceReviewsSummary | null>(null);

  /** Whether a review submission is in progress (to show loading state). */
  submitting = input<boolean>(false);

  /** Computed: array of reviews or empty array. */
  reviews = computed(() => this.summary()?.reviews ?? []);

  /** Computed: average rating rounded to 1 decimal. */
  averageRating = computed(() => {
    const avg = this.summary()?.averageRating ?? 0;
    return Math.round(avg * 10) / 10;
  });

  /** Computed: total review count. */
  reviewCount = computed(() => this.summary()?.reviewCount ?? 0);

  /** Generate star array for display. */
  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  /** Format date for display. */
  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /** Calculate bar width percentage for rating breakdown. */
  getBarWidth(level: number): number {
    const reviews = this.reviews();
    if (reviews.length === 0) return 0;
    const count = reviews.filter((r) => r.rating === level).length;
    return (count / reviews.length) * 100;
  }

  /** Get count of reviews for a specific rating level. */
  getCountForLevel(level: number): number {
    return this.reviews().filter((r) => r.rating === level).length;
  }
}