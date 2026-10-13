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

  public Space() {
  }

  public Space(String ownerId, String name, String description, Address address,
      GeoJsonPoint location, SpaceType type, int totalCapacity, long priceHourly, long priceDaily) {
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

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(String ownerId) {
    this.ownerId = ownerId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Address getAddress() {
    return address;
  }

  public void setAddress(Address address) {
    this.address = address;
  }

  public GeoJsonPoint getLocation() {
    return location;
  }

  public void setLocation(GeoJsonPoint location) {
    this.location = location;
  }

  public SpaceType getType() {
    return type;
  }

  public void setType(SpaceType type) {
    this.type = type;
  }

  public int getTotalCapacity() {
    return totalCapacity;
  }

  public void setTotalCapacity(int totalCapacity) {
    this.totalCapacity = totalCapacity;
  }

  public long getPriceHourly() {
    return priceHourly;
  }

  public void setPriceHourly(long priceHourly) {
    this.priceHourly = priceHourly;
  }

  public long getPriceDaily() {
    return priceDaily;
  }

  public void setPriceDaily(long priceDaily) {
    this.priceDaily = priceDaily;
  }

  public List<String> getAmenities() {
    return amenities;
  }

  public void setAmenities(List<String> amenities) {
    this.amenities = amenities;
  }

  public List<String> getImageUrls() {
    return imageUrls;
  }

  public void setImageUrls(List<String> imageUrls) {
    this.imageUrls = imageUrls;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
