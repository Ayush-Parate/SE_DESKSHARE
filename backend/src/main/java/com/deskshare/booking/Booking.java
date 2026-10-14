package com.deskshare.booking;

import java.time.Instant;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a booking reservation for a coworking space.
 *
 * <p>Bookings track the user, space, time window, pricing, and status.
 * This class is designed for extension by subclasses that may add specialized behavior.
 *
 * @see BookingStatus
 * @see AvailabilitySlot
 */
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

  /**
   * Default constructor for MongoDB deserialization.
   */
  public Booking() {
  }

  /**
   * Creates a new Booking with the specified details.
   *
   * @param userId     the ID of the user making the booking
   * @param spaceId    the ID of the space being booked
   * @param ownerId    the ID of the space owner
   * @param startTime  the booking start time
   * @param endTime    the booking end time
   * @param slotCount  number of slots booked
   * @param totalPrice total price in cents
   * @param currency   currency code (e.g., USD)
   */
  public Booking(final String userId, final String spaceId, final String ownerId,
      final Instant startTime, final Instant endTime, final int slotCount,
      final long totalPrice, final String currency) {
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

  /**
   * Gets the unique identifier.
   *
   * @return the booking ID
   */
  public String getId() {
    return id;
  }

  /**
   * Sets the unique identifier.
   *
   * @param id the booking ID to set
   */
  public void setId(final String id) {
    this.id = id;
  }

  /**
   * Gets the user ID who made the booking.
   *
   * @return the user ID
   */
  public String getUserId() {
    return userId;
  }

  /**
   * Sets the user ID.
   *
   * @param userId the user ID to set
   */
  public void setUserId(final String userId) {
    this.userId = userId;
  }

  /**
   * Gets the space ID.
   *
   * @return the space ID
   */
  public String getSpaceId() {
    return spaceId;
  }

  /**
   * Sets the space ID.
   *
   * @param spaceId the space ID to set
   */
  public void setSpaceId(final String spaceId) {
    this.spaceId = spaceId;
  }

  /**
   * Gets the owner ID.
   *
   * @return the owner ID
   */
  public String getOwnerId() {
    return ownerId;
  }

  /**
   * Sets the owner ID.
   *
   * @param ownerId the owner ID to set
   */
  public void setOwnerId(final String ownerId) {
    this.ownerId = ownerId;
  }

  /**
   * Gets the booking start time.
   *
   * @return the start time
   */
  public Instant getStartTime() {
    return startTime;
  }

  /**
   * Sets the booking start time.
   *
   * @param startTime the start time to set
   */
  public void setStartTime(final Instant startTime) {
    this.startTime = startTime;
  }

  /**
   * Gets the booking end time.
   *
   * @return the end time
   */
  public Instant getEndTime() {
    return endTime;
  }

  /**
   * Sets the booking end time.
   *
   * @param endTime the end time to set
   */
  public void setEndTime(final Instant endTime) {
    this.endTime = endTime;
  }

  /**
   * Gets the number of slots booked.
   *
   * @return the slot count
   */
  public int getSlotCount() {
    return slotCount;
  }

  /**
   * Sets the number of slots booked.
   *
   * @param slotCount the slot count to set
   */
  public void setSlotCount(final int slotCount) {
    this.slotCount = slotCount;
  }

  /**
   * Gets the total price in cents.
   *
   * @return the total price
   */
  public long getTotalPrice() {
    return totalPrice;
  }

  /**
   * Sets the total price in cents.
   *
   * @param totalPrice the total price to set
   */
  public void setTotalPrice(final long totalPrice) {
    this.totalPrice = totalPrice;
  }

  /**
   * Gets the currency code.
   *
   * @return the currency code
   */
  public String getCurrency() {
    return currency;
  }

  /**
   * Sets the currency code.
   *
   * @param currency the currency code to set
   */
  public void setCurrency(final String currency) {
    this.currency = currency;
  }

  /**
   * Gets the booking status.
   *
   * @return the booking status
   */
  public BookingStatus getStatus() {
    return status;
  }

  /**
   * Sets the booking status.
   *
   * @param status the booking status to set
   */
  public void setStatus(final BookingStatus status) {
    this.status = status;
  }

  /**
   * Gets the booking notes.
   *
   * @return the notes
   */
  public String getNotes() {
    return notes;
  }

  /**
   * Sets the booking notes.
   *
   * @param notes the notes to set
   */
  public void setNotes(final String notes) {
    this.notes = notes;
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
