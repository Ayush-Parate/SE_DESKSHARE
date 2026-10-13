package com.deskshare.booking.dto;

import com.deskshare.booking.Booking;
import com.deskshare.booking.BookingStatus;
import java.time.Instant;

public record BookingResponse(
    String id,
    String userId,
    String spaceId,
    String ownerId,
    Instant startTime,
    Instant endTime,
    int slotCount,
    long totalPrice,
    String currency,
    BookingStatus status,
    String notes,
    Instant createdAt
) {

  public static BookingResponse fromEntity(Booking booking) {
    return new BookingResponse(
        booking.getId(),
        booking.getUserId(),
        booking.getSpaceId(),
        booking.getOwnerId(),
        booking.getStartTime(),
        booking.getEndTime(),
        booking.getSlotCount(),
        booking.getTotalPrice(),
        booking.getCurrency(),
        booking.getStatus(),
        booking.getNotes(),
        booking.getCreatedAt()
    );
  }
}
