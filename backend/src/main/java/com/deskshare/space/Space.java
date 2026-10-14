package com.deskshare.space;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a coworking space listing in the DeskShare platform.
 *
 * <p>Spaces can be of various types (hot desk, dedicated desk, private office, meeting room)
 * and have configurable pricing, capacity, amenities, and location data.
 * This class is designed for extension by subclasses that may add specialized behavior.
 *
 * @see SpaceType
 * @see Address
 */
@Document(collection = "spaces")
@CompoundIndexes({
    @CompoundIndex(name = "owner_active_idx", def = "{'ownerId': 1, 'active': 1}"),
    @CompoundIndex(name = "type_active_price_idx", def = "{'type': 1, 'active': 1, 'priceHourly': 1}")
})
public class Space {

  @Id
  private String id;

  @Indexed
  private String ownerId;

  private String name;

  private String description;

  private Address address;

  @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
  private GeoJsonPoint location;

  @Indexed
  private SpaceType type = SpaceType.HOT_DESK;

  private int totalCapacity;

  private long priceHourly; // in cents

  private long priceDaily; // in cents

  private List<String> amenities = new ArrayList<>();

  private List<String> imageUrls = new ArrayList<>();

  private boolean active = true;

  @CreatedDate
  private Instant createdAt;

  @LastModifiedDate
  private Instant updatedAt;

  /**
   * Default constructor for MongoDB deserialization.
   */
  public Space() {
  }

  /**
   * Creates a new Space with the specified details.
   *
   * @param ownerId     the ID of the space owner
   * @param name        the display name of the space
   * @param description detailed description of the space
   * @param address     physical address of the space
   * @param location    geographic coordinates for proximity search
   * @param type        the type of space (hot desk, dedicated desk, etc.)
   * @param totalCapacity maximum number of concurrent bookings
   * @param priceHourly hourly price in cents
   * @param priceDaily  daily price in cents
   */
  public Space(final String ownerId, final String name, final String description,
      final Address address, final GeoJsonPoint location, final SpaceType type,
      final int totalCapacity, final long priceHourly, final long priceDaily) {
    this.ownerId = ownerId;
    this.name = name;
    this.description = description;
    this.address = address;
    this.location = location;
    this.type = type;
    this.totalCapacity = totalCapacity;
    this.priceHourly = priceHourly;
    this.priceDaily = priceDaily;
    this.active = true;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }

  /**
   * Gets the unique identifier.
   *
   * @return the space ID
   */
  public String getId() {
    return id;
  }

  /**
   * Sets the unique identifier.
   *
   * @param id the space ID to set
   */
  public void setId(final String id) {
    this.id = id;
  }

  /**
   * Gets the owner's user ID.
   *
   * @return the owner ID
   */
  public String getOwnerId() {
    return ownerId;
  }

  /**
   * Sets the owner's user ID.
   *
   * @param ownerId the owner ID to set
   */
  public void setOwnerId(final String ownerId) {
    this.ownerId = ownerId;
  }

  /**
   * Gets the display name.
   *
   * @return the space name
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the display name.
   *
   * @param name the name to set
   */
  public void setName(final String name) {
    this.name = name;
  }

  /**
   * Gets the detailed description.
   *
   * @return the description
   */
  public String getDescription() {
    return description;
  }

  /**
   * Sets the detailed description.
   *
   * @param description the description to set
   */
  public void setDescription(final String description) {
    this.description = description;
  }

  /**
   * Gets the physical address.
   *
   * @return the address
   */
  public Address getAddress() {
    return address;
  }

  /**
   * Sets the physical address.
   *
   * @param address the address to set
   */
  public void setAddress(final Address address) {
    this.address = address;
  }

  /**
   * Gets the geographic location.
   *
   * @return the location as GeoJsonPoint
   */
  public GeoJsonPoint getLocation() {
    return location;
  }

  /**
   * Sets the geographic location.
   *
   * @param location the location to set
   */
  public void setLocation(final GeoJsonPoint location) {
    this.location = location;
  }

  /**
   * Gets the space type.
   *
   * @return the space type
   */
  public SpaceType getType() {
    return type;
  }

  /**
   * Sets the space type.
   *
   * @param type the space type to set
   */
  public void setType(final SpaceType type) {
    this.type = type;
  }

  /**
   * Gets the total capacity.
   *
   * @return the total capacity
   */
  public int getTotalCapacity() {
    return totalCapacity;
  }

  /**
   * Sets the total capacity.
   *
   * @param totalCapacity the capacity to set
   */
  public void setTotalCapacity(final int totalCapacity) {
    this.totalCapacity = totalCapacity;
  }

  /**
   * Gets the hourly price in cents.
   *
   * @return the hourly price in cents
   */
  public long getPriceHourly() {
    return priceHourly;
  }

  /**
   * Sets the hourly price in cents.
   *
   * @param priceHourly the hourly price to set
   */
  public void setPriceHourly(final long priceHourly) {
    this.priceHourly = priceHourly;
  }

  /**
   * Gets the daily price in cents.
   *
   * @return the daily price in cents
   */
  public long getPriceDaily() {
    return priceDaily;
  }

  /**
   * Sets the daily price in cents.
   *
   * @param priceDaily the daily price to set
   */
  public void setPriceDaily(final long priceDaily) {
    this.priceDaily = priceDaily;
  }

  /**
   * Gets the list of amenities.
   *
   * @return unmodifiable list of amenities
   */
  public List<String> getAmenities() {
    return amenities;
  }

  /**
   * Sets the list of amenities.
   *
   * @param amenities the amenities to set
   */
  public void setAmenities(final List<String> amenities) {
    this.amenities = amenities;
  }

  /**
   * Gets the list of image URLs.
   *
   * @return unmodifiable list of image URLs
   */
  public List<String> getImageUrls() {
    return imageUrls;
  }

  /**
   * Sets the list of image URLs.
   *
   * @param imageUrls the image URLs to set
   */
  public void setImageUrls(final List<String> imageUrls) {
    this.imageUrls = imageUrls;
  }

  /**
   * Checks if the space is active and available for booking.
   *
   * @return true if active, false otherwise
   */
  public boolean isActive() {
    return active;
  }

  /**
   * Sets the active status.
   *
   * @param active the active status to set
   */
  public void setActive(final boolean active) {
    this.active = active;
  }

  /**
   * Gets the creation timestamp.
   *
   * @return the creation instant
   */
  public Instant getCreatedAt() {
    return createdAt;
  }

  /**
   * Sets the creation timestamp.
   *
   * @param createdAt the creation instant to set
   */
  public void setCreatedAt(final Instant createdAt) {
    this.createdAt = createdAt;
  }

  /**
   * Gets the last modification timestamp.
   *
   * @return the last modified instant
   */
  public Instant getUpdatedAt() {
    return updatedAt;
  }

  /**
   * Sets the last modification timestamp.
   *
   * @param updatedAt the last modified instant to set
   */
  public void setUpdatedAt(final Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
