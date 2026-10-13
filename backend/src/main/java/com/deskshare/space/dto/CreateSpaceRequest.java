package com.deskshare.space.dto;

import com.deskshare.space.Address;
import com.deskshare.space.SpaceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateSpaceRequest(
    @NotBlank(message = "Owner ID is required")
    String ownerId,

    @NotBlank(message = "Space name is required")
    String name,

    String description,

    @NotNull(message = "Address is required")
    Address address,

    Double longitude,

    Double latitude,

    @NotNull(message = "Space type is required")
    SpaceType type,

    @Min(value = 1, message = "Total capacity must be at least 1")
    int totalCapacity,

    @Min(value = 0, message = "Hourly price cannot be negative")
    long priceHourly,

    @Min(value = 0, message = "Daily price cannot be negative")
    long priceDaily,

    List<String> amenities,

    List<String> imageUrls
) {}
