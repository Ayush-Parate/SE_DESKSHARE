package com.deskshare.booking;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BookingAndSlotModelTest {

  @Test
  @DisplayName("Booking entity stores reservation fields and statuses correctly")
  void testBookingEntity() {
    Instant start = Instant.parse("2026-10-14T09:00:00Z");
    Instant end = Instant.parse("2026-10-14T17:00:00Z");

    Booking booking = new Booking("cust_1", "space_1", "owner_1", start, end, 1, 7500L, "USD");
    booking.setNotes("Window desk please");

    assertThat(booking.getUserId()).isEqualTo("cust_1");
    assertThat(booking.getSpaceId()).isEqualTo("space_1");
    assertThat(booking.getOwnerId()).isEqualTo("owner_1");
    assertThat(booking.getStartTime()).isEqualTo(start);
    assertThat(booking.getEndTime()).isEqualTo(end);
    assertThat(booking.getTotalPrice()).isEqualTo(7500L);
    assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    assertThat(booking.getNotes()).isEqualTo("Window desk please");

    booking.setStatus(BookingStatus.CANCELLED);
    assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
  }

  @Test
  @DisplayName("AvailabilitySlot tracks discrete capacity and decrement math accurately")
  void testAvailabilitySlot() {
    LocalDate date = LocalDate.of(2026, 10, 14);
    Instant start = Instant.parse("2026-10-14T09:00:00Z");
    Instant end = Instant.parse("2026-10-14T10:00:00Z");

    AvailabilitySlot slot = new AvailabilitySlot("space_1", date, start, end, 10);

    assertThat(slot.getTotalCapacity()).isEqualTo(10);
    assertThat(slot.getRemainingCapacity()).isEqualTo(10);
    assertThat(slot.getBookedCount()).isEqualTo(0);

    // Simulate 1 booking decrement
    slot.setRemainingCapacity(slot.getRemainingCapacity() - 1);
    slot.setBookedCount(slot.getBookedCount() + 1);

    assertThat(slot.getRemainingCapacity()).isEqualTo(9);
    assertThat(slot.getBookedCount()).isEqualTo(1);
  }
}
