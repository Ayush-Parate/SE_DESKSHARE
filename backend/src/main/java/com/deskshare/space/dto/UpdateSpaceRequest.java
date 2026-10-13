package com.deskshare.space.dto;

import com.deskshare.space.Address;
import com.deskshare.space.SpaceType;
import java.util.List;

public record UpdateSpaceRequest(
    String name,
    String description,
    Address address,
    Double longitude,
    Double latitude,
    SpaceType type,
    Integer totalCapacity,
    Long priceHourly,
    Long priceDaily,
    List<String> amenities,
    List<String> imageUrls,
    Boolean active
) {}
