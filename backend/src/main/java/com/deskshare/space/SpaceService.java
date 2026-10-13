package com.deskshare.space;

import com.deskshare.common.exception.BadRequestException;
import com.deskshare.common.exception.ResourceNotFoundException;
import com.deskshare.space.dto.CreateSpaceRequest;
import com.deskshare.space.dto.SpaceResponse;
import com.deskshare.space.dto.UpdateSpaceRequest;
import java.util.List;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;

@Service
public class SpaceService {

  private final SpaceRepository spaceRepository;

  public SpaceService(SpaceRepository spaceRepository) {
    this.spaceRepository = spaceRepository;
  }

  public SpaceResponse createSpace(CreateSpaceRequest request) {
    GeoJsonPoint geoPoint = null;
    if (request.longitude() != null && request.latitude() != null) {
      geoPoint = new GeoJsonPoint(request.longitude(), request.latitude());
    }

    Space space = new Space(
        request.ownerId(),
        request.name().trim(),
        request.description(),
        request.address(),
        geoPoint,
        request.type(),
        request.totalCapacity(),
        request.priceHourly(),
        request.priceDaily()
    );

    if (request.amenities() != null) {
      space.setAmenities(normalizeStrings(request.amenities()));
    }
    if (request.imageUrls() != null) {
      space.setImageUrls(normalizeStrings(request.imageUrls()));
    }

    Space saved = spaceRepository.save(space);
    return SpaceResponse.fromEntity(saved);
  }

  public SpaceResponse getSpaceById(String id) {
    Space space = getExistingSpace(id);
    return SpaceResponse.fromEntity(space);
  }

  public List<SpaceResponse> getAllSpaces() {
    return spaceRepository.findAll().stream()
        .filter(Space::isActive)
        .map(SpaceResponse::fromEntity)
        .toList();
  }

  public List<SpaceResponse> getSpacesByOwner(String ownerId) {
    return spaceRepository.findByOwnerId(ownerId).stream()
        .filter(Space::isActive)
        .map(SpaceResponse::fromEntity)
        .toList();
  }

  public List<SpaceResponse> getSpacesByType(SpaceType type) {
    return spaceRepository.findByTypeAndActiveTrue(type).stream()
        .map(SpaceResponse::fromEntity)
        .toList();
  }

  public List<SpaceResponse> searchSpaces(String ownerId, SpaceType type, String city,
      String amenity, Long minPrice, Long maxPrice) {
    return spaceRepository.findAll().stream()
        .filter(Space::isActive)
        .filter(space -> ownerId == null || ownerId.equals(space.getOwnerId()))
        .filter(space -> type == null || type == space.getType())
        .filter(space -> city == null || cityMatches(space, city))
        .filter(space -> amenity == null || amenityMatches(space, amenity))
        .filter(space -> minPrice == null || space.getPriceHourly() >= minPrice)
        .filter(space -> maxPrice == null || space.getPriceHourly() <= maxPrice)
        .map(SpaceResponse::fromEntity)
        .toList();
  }

  public SpaceResponse updateSpace(String id, UpdateSpaceRequest request) {
    Space space = getExistingSpace(id);

    if (request.name() != null && !request.name().isBlank()) {
      space.setName(request.name().trim());
    }
    if (request.description() != null) {
      space.setDescription(request.description());
    }
    if (request.address() != null) {
      space.setAddress(request.address());
    }
    if (request.longitude() != null || request.latitude() != null) {
      if (request.longitude() == null || request.latitude() == null) {
        throw new BadRequestException("Both longitude and latitude must be provided together");
      }
      space.setLocation(new GeoJsonPoint(request.longitude(), request.latitude()));
    }
    if (request.type() != null) {
      space.setType(request.type());
    }
    if (request.totalCapacity() != null) {
      if (request.totalCapacity() < 1) {
        throw new BadRequestException("Total capacity must be at least 1");
      }
      space.setTotalCapacity(request.totalCapacity());
    }
    if (request.priceHourly() != null) {
      if (request.priceHourly() < 0) {
        throw new BadRequestException("Hourly price cannot be negative");
      }
      space.setPriceHourly(request.priceHourly());
    }
    if (request.priceDaily() != null) {
      if (request.priceDaily() < 0) {
        throw new BadRequestException("Daily price cannot be negative");
      }
      space.setPriceDaily(request.priceDaily());
    }
    if (request.amenities() != null) {
      space.setAmenities(normalizeStrings(request.amenities()));
    }
    if (request.imageUrls() != null) {
      space.setImageUrls(normalizeStrings(request.imageUrls()));
    }
    if (request.active() != null) {
      space.setActive(request.active());
    }

    return SpaceResponse.fromEntity(spaceRepository.save(space));
  }

  public void deleteSpace(String id) {
    Space space = getExistingSpace(id);
    space.setActive(false);
    spaceRepository.save(space);
  }

  private Space getExistingSpace(String id) {
    return spaceRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Space", "id", id));
  }

  private boolean cityMatches(Space space, String city) {
    return space.getAddress() != null
        && space.getAddress().getCity() != null
        && space.getAddress().getCity().equalsIgnoreCase(city.trim());
  }

  private boolean amenityMatches(Space space, String amenity) {
    if (space.getAmenities() == null) {
      return false;
    }
    return space.getAmenities().stream()
        .map(String::trim)
        .anyMatch(value -> value.equalsIgnoreCase(amenity.trim()));
  }

  private List<String> normalizeStrings(List<String> values) {
    return values.stream()
        .filter(value -> value != null && !value.isBlank())
        .map(String::trim)
        .toList();
  }
}
