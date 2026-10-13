package com.deskshare.booking;

import com.deskshare.booking.dto.BookingResponse;
import com.deskshare.booking.dto.CreateBookingRequest;
import com.deskshare.common.exception.BadRequestException;
import com.deskshare.common.exception.ConflictException;
import com.deskshare.common.exception.ResourceNotFoundException;
import com.deskshare.space.Space;
import com.deskshare.space.SpaceRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

  private final BookingRepository bookingRepository;
  private final SpaceRepository spaceRepository;
  private final AvailabilitySlotRepository availabilitySlotRepository;

  public BookingService(BookingRepository bookingRepository, SpaceRepository spaceRepository,
      AvailabilitySlotRepository availabilitySlotRepository) {
    this.bookingRepository = bookingRepository;
    this.spaceRepository = spaceRepository;
    this.availabilitySlotRepository = availabilitySlotRepository;
  }

  public BookingResponse createBooking(CreateBookingRequest request) {
    if (request.endTime().isBefore(request.startTime()) || request.endTime().equals(request.startTime())) {
      throw new BadRequestException("End time must be strictly after start time");
    }
    if (request.slotCount() < 1) {
      throw new BadRequestException("Slot count must be at least 1");
    }

    Space space = spaceRepository.findById(request.spaceId())
        .orElseThrow(() -> new ResourceNotFoundException("Space", "id", request.spaceId()));

    if (!space.isActive()) {
      throw new BadRequestException("Cannot book an inactive space");
    }
    if (request.slotCount() > space.getTotalCapacity()) {
      throw new BadRequestException("Requested slot count exceeds the total capacity of the space");
    }

    List<AvailabilitySlot> requestedSlots = buildAvailabilitySlots(space, request.startTime(), request.endTime());
    List<AvailabilitySlot> slotsToPersist = new ArrayList<>();

    for (AvailabilitySlot requestedSlot : requestedSlots) {
      AvailabilitySlot existingSlot = availabilitySlotRepository
          .findBySpaceIdAndStartTime(space.getId(), requestedSlot.getStartTime())
          .orElse(null);

      AvailabilitySlot resolvedSlot = existingSlot != null ? existingSlot : requestedSlot;
      if (resolvedSlot.getRemainingCapacity() < request.slotCount()) {
        throw new ConflictException(
            "Not enough remaining capacity for the requested time window starting at "
                + requestedSlot.getStartTime());
      }

      AvailabilitySlot updatedSlot = new AvailabilitySlot(
          resolvedSlot.getSpaceId(),
          resolvedSlot.getSlotDate(),
          resolvedSlot.getStartTime(),
          resolvedSlot.getEndTime(),
          resolvedSlot.getTotalCapacity());
      updatedSlot.setId(resolvedSlot.getId());
      updatedSlot.setRemainingCapacity(resolvedSlot.getRemainingCapacity() - request.slotCount());
      updatedSlot.setBookedCount(resolvedSlot.getBookedCount() + request.slotCount());
      slotsToPersist.add(updatedSlot);
    }

    for (AvailabilitySlot slotToPersist : slotsToPersist) {
      availabilitySlotRepository.save(slotToPersist);
    }

    long durationHours = Math.max(1, (Duration.between(request.startTime(), request.endTime()).toMinutes() + 59) / 60);
    long totalPrice = durationHours * space.getPriceHourly() * request.slotCount();

    Booking booking = new Booking(
        request.userId(),
        request.spaceId(),
        space.getOwnerId(),
        request.startTime(),
        request.endTime(),
        request.slotCount(),
        totalPrice,
        "USD"
    );
    booking.setNotes(request.notes());

    Booking saved = bookingRepository.save(booking);
    return BookingResponse.fromEntity(saved);
  }

  public BookingResponse getBookingById(String id) {
    Booking booking = bookingRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    return BookingResponse.fromEntity(booking);
  }

  public List<BookingResponse> getBookingsByUser(String userId) {
    return bookingRepository.findByUserIdOrderByStartTimeDesc(userId).stream()
        .map(BookingResponse::fromEntity)
        .toList();
  }

  public List<BookingResponse> getBookingsByOwner(String ownerId) {
    return bookingRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
        .map(BookingResponse::fromEntity)
        .toList();
  }

  public BookingResponse cancelBooking(String id) {
    Booking booking = bookingRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

    if (booking.getStatus() == BookingStatus.CANCELLED) {
      return BookingResponse.fromEntity(booking);
    }

    Space space = spaceRepository.findById(booking.getSpaceId())
        .orElseThrow(() -> new ResourceNotFoundException("Space", "id", booking.getSpaceId()));

    List<AvailabilitySlot> requestedSlots = buildAvailabilitySlots(space, booking.getStartTime(), booking.getEndTime());
    for (AvailabilitySlot requestedSlot : requestedSlots) {
      AvailabilitySlot existingSlot = availabilitySlotRepository
          .findBySpaceIdAndStartTime(space.getId(), requestedSlot.getStartTime())
          .orElse(null);
      if (existingSlot == null) {
        continue;
      }

      existingSlot.setRemainingCapacity(existingSlot.getRemainingCapacity() + booking.getSlotCount());
      existingSlot.setBookedCount(Math.max(0, existingSlot.getBookedCount() - booking.getSlotCount()));
      availabilitySlotRepository.save(existingSlot);
    }

    booking.setStatus(BookingStatus.CANCELLED);
    Booking updated = bookingRepository.save(booking);
    return BookingResponse.fromEntity(updated);
  }

  private List<AvailabilitySlot> buildAvailabilitySlots(Space space, Instant startTime, Instant endTime) {
    List<AvailabilitySlot> slots = new ArrayList<>();
    Instant current = startTime;

    while (current.isBefore(endTime)) {
      Instant next = current.plusSeconds(Duration.ofHours(1).getSeconds());
      if (next.isAfter(endTime)) {
        next = endTime;
      }

      LocalDate slotDate = LocalDate.ofInstant(current, ZoneOffset.UTC);
      AvailabilitySlot slot = new AvailabilitySlot(
          space.getId(),
          slotDate,
          current,
          next,
          space.getTotalCapacity()
      );
      slots.add(slot);
      current = next;
    }

    return slots;
  }
}
