package com.deskshare.space.dto;

import com.deskshare.space.Address;
import com.deskshare.space.Space;
import com.deskshare.space.SpaceType;
import java.time.Instant;
import java.util.List;

public record SpaceResponse(
    String id,
    String ownerId,
    String name,
    String description,
    Address address,
    Double longitude,
    Double latitude,
    SpaceType type,
    int totalCapacity,
    long priceHourly,
    long priceDaily,
    List<String> amenities,
    List<String> imageUrls,
    boolean active,
    Instant createdAt
) {

  public static SpaceResponse fromEntity(Space space) {
    Double lon = space.getLocation() != null ? space.getLocation().getX() : null;
    Double lat = space.getLocation() != null ? space.getLocation().getY() : null;

    return new SpaceResponse(
        space.getId(),
        space.getOwnerId(),
        space.getName(),
        space.getDescription(),
        space.getAddress(),
        lon,
        lat,
        space.getType(),
        space.getTotalCapacity(),
        space.getPriceHourly(),
        space.getPriceDaily(),
        space.getAmenities(),
        space.getImageUrls(),
        space.isActive(),
        space.getCreatedAt()
    );
  }
}
