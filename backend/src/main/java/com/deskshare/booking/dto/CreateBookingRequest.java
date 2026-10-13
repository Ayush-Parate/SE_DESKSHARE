package com.deskshare.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record CreateBookingRequest(
    @NotBlank(message = "User ID is required")
    String userId,

    @NotBlank(message = "Space ID is required")
    String spaceId,

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    Instant startTime,

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    Instant endTime,

    @Min(value = 1, message = "Slot count must be at least 1")
    int slotCount,

    String notes
) {}
