package com.deskshare.booking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.deskshare.booking.dto.BookingResponse;
import com.deskshare.booking.dto.CreateBookingRequest;
import com.deskshare.common.exception.BadRequestException;
import com.deskshare.common.exception.ConflictException;
import com.deskshare.common.exception.ResourceNotFoundException;
import com.deskshare.space.Address;
import com.deskshare.space.Space;
import com.deskshare.space.SpaceRepository;
import com.deskshare.space.SpaceType;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

  @Mock
  private BookingRepository bookingRepository;

  @Mock
  private SpaceRepository spaceRepository;

  @Mock
  private AvailabilitySlotRepository availabilitySlotRepository;

  private BookingService bookingService;

  @BeforeEach
  void setUp() {
    bookingService = new BookingService(bookingRepository, spaceRepository, availabilitySlotRepository);
  }

  @Test
  @DisplayName("createBooking calculates price correctly based on hours and slot count")
  void testCreateBookingSuccess() {
    Instant start = Instant.parse("2026-10-15T10:00:00Z");
    Instant end = Instant.parse("2026-10-15T14:00:00Z"); // 4 hours
    CreateBookingRequest request = new CreateBookingRequest(
        "user_1", "space_1", start, end, 2, "Test notes");

    Space space = new Space("owner_1", "Downtown Hub", "desc",
        new Address("1 St", "City", "ST", "12345", "USA"), null, SpaceType.HOT_DESK, 20, 1500L, 7500L);
    space.setId("space_1");

    when(spaceRepository.findById("space_1")).thenReturn(Optional.of(space));
    when(availabilitySlotRepository.findBySpaceIdAndStartTime("space_1", start)).thenReturn(Optional.empty());
    when(availabilitySlotRepository.save(any(AvailabilitySlot.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
      Booking b = invocation.getArgument(0);
      b.setId("booking_999");
      return b;
    });

    BookingResponse response = bookingService.createBooking(request);

    assertThat(response.id()).isEqualTo("booking_999");
    assertThat(response.userId()).isEqualTo("user_1");
    assertThat(response.spaceId()).isEqualTo("space_1");
    assertThat(response.ownerId()).isEqualTo("owner_1");
    assertThat(response.totalPrice()).isEqualTo(12000L);
    assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
    verify(bookingRepository).save(any(Booking.class));
  }

  @Test
  @DisplayName("createBooking fails when endTime is before startTime")
  void testCreateBookingInvalidTimeRange() {
    Instant start = Instant.parse("2026-10-15T14:00:00Z");
    Instant end = Instant.parse("2026-10-15T10:00:00Z");
    CreateBookingRequest request = new CreateBookingRequest(
        "user_1", "space_1", start, end, 1, null);

    assertThatThrownBy(() -> bookingService.createBooking(request))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("End time must be strictly after start time");
  }

  @Test
  @DisplayName("createBooking rejects requests that exceed the remaining slot capacity")
  void testCreateBookingCapacityConflict() {
    Instant start = Instant.parse("2026-10-15T10:00:00Z");
    Instant end = Instant.parse("2026-10-15T11:00:00Z");
    CreateBookingRequest request = new CreateBookingRequest(
        "user_1", "space_1", start, end, 3, "Full");

    Space space = new Space("owner_1", "Downtown Hub", "desc",
        new Address("1 St", "City", "ST", "12345", "USA"), null, SpaceType.HOT_DESK, 5, 1500L, 7500L);
    space.setId("space_1");

    AvailabilitySlot existing = new AvailabilitySlot("space_1", java.time.LocalDate.of(2026, 10, 15), start, end, 5);
    existing.setRemainingCapacity(1);
    existing.setBookedCount(4);

    when(spaceRepository.findById("space_1")).thenReturn(Optional.of(space));
    when(availabilitySlotRepository.findBySpaceIdAndStartTime("space_1", start)).thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> bookingService.createBooking(request))
        .isInstanceOf(ConflictException.class)
        .hasMessageContaining("Not enough remaining capacity");
  }

  @Test
  @DisplayName("createBooking validates the full requested window before mutating any slot")
  void testCreateBookingAvoidsPartialMutationOnConflict() {
    Instant start = Instant.parse("2026-10-15T10:00:00Z");
    Instant end = Instant.parse("2026-10-15T12:00:00Z");
    CreateBookingRequest request = new CreateBookingRequest(
        "user_1", "space_1", start, end, 3, "Full");

    Space space = new Space("owner_1", "Downtown Hub", "desc",
        new Address("1 St", "City", "ST", "12345", "USA"), null, SpaceType.HOT_DESK, 5, 1500L, 7500L);
    space.setId("space_1");

    AvailabilitySlot firstSlot = new AvailabilitySlot("space_1", java.time.LocalDate.of(2026, 10, 15), start,
        start.plusSeconds(3600), 5);
    firstSlot.setRemainingCapacity(5);
    firstSlot.setBookedCount(0);

    Instant secondStart = start.plusSeconds(3600);
    AvailabilitySlot secondSlot = new AvailabilitySlot("space_1", java.time.LocalDate.of(2026, 10, 15), secondStart,
        end, 5);
    secondSlot.setRemainingCapacity(2);
    secondSlot.setBookedCount(3);

    when(spaceRepository.findById("space_1")).thenReturn(Optional.of(space));
    when(availabilitySlotRepository.findBySpaceIdAndStartTime("space_1", start)).thenReturn(Optional.of(firstSlot));
    when(availabilitySlotRepository.findBySpaceIdAndStartTime("space_1", secondStart)).thenReturn(Optional.of(secondSlot));

    assertThatThrownBy(() -> bookingService.createBooking(request))
        .isInstanceOf(ConflictException.class)
        .hasMessageContaining("Not enough remaining capacity");

    assertThat(firstSlot.getRemainingCapacity()).isEqualTo(5);
    assertThat(secondSlot.getRemainingCapacity()).isEqualTo(2);
    verify(availabilitySlotRepository, never()).save(any(AvailabilitySlot.class));
  }

  @Test
  @DisplayName("cancelBooking restores capacity and booked count on each affected slot")
  void testCancelBookingRestoresSlotCapacity() {
    Instant start = Instant.parse("2026-10-15T10:00:00Z");
    Instant end = Instant.parse("2026-10-15T12:00:00Z");
    Booking booking = new Booking("user_1", "space_1", "owner_1",
        start, end, 2, 3000L, "USD");
    booking.setId("booking_123");

    Space space = new Space("owner_1", "Downtown Hub", "desc",
        new Address("1 St", "City", "ST", "12345", "USA"), null, SpaceType.HOT_DESK, 5, 1500L, 7500L);
    space.setId("space_1");

    AvailabilitySlot firstSlot = new AvailabilitySlot("space_1", java.time.LocalDate.of(2026, 10, 15), start,
        start.plusSeconds(3600), 5);
    firstSlot.setRemainingCapacity(3);
    firstSlot.setBookedCount(2);

    Instant secondStart = start.plusSeconds(3600);
    AvailabilitySlot secondSlot = new AvailabilitySlot("space_1", java.time.LocalDate.of(2026, 10, 15), secondStart,
        end, 5);
    secondSlot.setRemainingCapacity(3);
    secondSlot.setBookedCount(2);

    when(bookingRepository.findById("booking_123")).thenReturn(Optional.of(booking));
    when(spaceRepository.findById("space_1")).thenReturn(Optional.of(space));
    when(availabilitySlotRepository.findBySpaceIdAndStartTime("space_1", start)).thenReturn(Optional.of(firstSlot));
    when(availabilitySlotRepository.findBySpaceIdAndStartTime("space_1", secondStart)).thenReturn(Optional.of(secondSlot));
    when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
    when(availabilitySlotRepository.save(any(AvailabilitySlot.class))).thenAnswer(inv -> inv.getArgument(0));

    BookingResponse response = bookingService.cancelBooking("booking_123");

    assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
    assertThat(firstSlot.getRemainingCapacity()).isEqualTo(5);
    assertThat(firstSlot.getBookedCount()).isEqualTo(0);
    assertThat(secondSlot.getRemainingCapacity()).isEqualTo(5);
    assertThat(secondSlot.getBookedCount()).isEqualTo(0);
  }

  @Test
  @DisplayName("cancelBooking updates status to CANCELLED")
  void testCancelBooking() {
    Booking booking = new Booking("user_1", "space_1", "owner_1",
        Instant.now(), Instant.now().plusSeconds(3600), 1, 1500L, "USD");
    booking.setId("booking_123");

    Space space = new Space("owner_1", "Downtown Hub", "desc",
        new Address("1 St", "City", "ST", "12345", "USA"), null, SpaceType.HOT_DESK, 5, 1500L, 7500L);
    space.setId("space_1");

    when(bookingRepository.findById("booking_123")).thenReturn(Optional.of(booking));
    when(spaceRepository.findById("space_1")).thenReturn(Optional.of(space));
    when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
    when(availabilitySlotRepository.findBySpaceIdAndStartTime("space_1", booking.getStartTime())).thenReturn(Optional.empty());

    BookingResponse response = bookingService.cancelBooking("booking_123");

    assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
    verify(bookingRepository).save(booking);
  }
}
