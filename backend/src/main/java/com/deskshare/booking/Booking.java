package com.deskshare.booking;

import java.time.Instant;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
@CompoundIndexes({
    @CompoundIndex(name = "user_startTime_idx", def = "{'userId': 1, 'startTime': -1}"),
    @CompoundIndex(name = "space_window_status_idx", def = "{'spaceId': 1, 'startTime': 1, 'endTime': 1, 'status': 1}"),
    @CompoundIndex(name = "owner_createdAt_idx", def = "{'ownerId': 1, 'createdAt': -1}")
})
public class Booking {

  @Id
  private String id;

  @Indexed
  private String userId;

  @Indexed
  private String spaceId;

  @Indexed
  private String ownerId;

  private Instant startTime;

  private Instant endTime;

  private int slotCount = 1;

  private long totalPrice; // in cents

  private String currency = "USD";

  private BookingStatus status = BookingStatus.CONFIRMED;

  private String notes;

  @CreatedDate
  private Instant createdAt;

  @LastModifiedDate
  private Instant updatedAt;

  public Booking() {
  }

  public Booking(String userId, String spaceId, String ownerId, Instant startTime,
      Instant endTime, int slotCount, long totalPrice, String currency) {
    this.userId = userId;
    this.spaceId = spaceId;
    this.ownerId = ownerId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.slotCount = slotCount;
    this.totalPrice = totalPrice;
    this.currency = currency;
    this.status = BookingStatus.CONFIRMED;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public String getSpaceId() {
    return spaceId;
  }

  public void setSpaceId(String spaceId) {
    this.spaceId = spaceId;
  }

  public String getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(String ownerId) {
    this.ownerId = ownerId;
  }

  public Instant getStartTime() {
    return startTime;
  }

  public void setStartTime(Instant startTime) {
    this.startTime = startTime;
  }

  public Instant getEndTime() {
    return endTime;
  }

  public void setEndTime(Instant endTime) {
    this.endTime = endTime;
  }

  public int getSlotCount() {
    return slotCount;
  }

  public void setSlotCount(int slotCount) {
    this.slotCount = slotCount;
  }

  public long getTotalPrice() {
    return totalPrice;
  }

  public void setTotalPrice(long totalPrice) {
    this.totalPrice = totalPrice;
  }

  public String getCurrency() {
    return currency;
  }

  public void setCurrency(String currency) {
    this.currency = currency;
  }

  public BookingStatus getStatus() {
    return status;
  }

  public void setStatus(BookingStatus status) {
    this.status = status;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
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
