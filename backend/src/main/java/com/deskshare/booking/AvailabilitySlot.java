package com.deskshare.booking;

import java.time.Instant;
import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents an availability time slot for a space.
 *
 * <p>Slots track capacity and bookings for a specific date/time window.
 * This class is designed for extension by subclasses that may add specialized behavior.
 *
 * @see Booking
 */
@Document(collection = "availability_slots")
@CompoundIndexes({
    @CompoundIndex(name = "space_startTime_uniq", def = "{'spaceId': 1, 'startTime': 1}", unique = true),
    @CompoundIndex(name = "space_slotDate_idx", def = "{'spaceId': 1, 'slotDate': 1}")
})
public class AvailabilitySlot {

  @Id
  private String id;

  private String spaceId;

  private LocalDate slotDate;

  private Instant startTime;

  private Instant endTime;

  private int totalCapacity;

  private int remainingCapacity;

  private int bookedCount;

  @Version
  private Long version;

  /**
   * Default constructor for MongoDB deserialization.
   */
  public AvailabilitySlot() {
  }

  /**
   * Creates a new AvailabilitySlot with the specified details.
   *
   * @param spaceId      the ID of the space
   * @param slotDate     the date of the slot
   * @param startTime    the slot start time
   * @param endTime      the slot end time
   * @param totalCapacity the total capacity for this slot
   */
  public AvailabilitySlot(final String spaceId, final LocalDate slotDate,
      final Instant startTime, final Instant endTime, final int totalCapacity) {
    this.spaceId = spaceId;
    this.slotDate = slotDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.totalCapacity = totalCapacity;
    this.remainingCapacity = totalCapacity;
    this.bookedCount = 0;
  }

  /**
   * Gets the unique identifier.
   *
   * @return the slot ID
   */
  public String getId() {
    return id;
  }

  /**
   * Sets the unique identifier.
   *
   * @param id the slot ID to set
   */
  public void setId(final String id) {
    this.id = id;
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
   * Gets the slot date.
   *
   * @return the slot date
   */
  public LocalDate getSlotDate() {
    return slotDate;
  }

  /**
   * Sets the slot date.
   *
   * @param slotDate the slot date to set
   */
  public void setSlotDate(final LocalDate slotDate) {
    this.slotDate = slotDate;
  }

  /**
   * Gets the start time.
   *
   * @return the start time
   */
  public Instant getStartTime() {
    return startTime;
  }

  /**
   * Sets the start time.
   *
   * @param startTime the start time to set
   */
  public void setStartTime(final Instant startTime) {
    this.startTime = startTime;
  }

  /**
   * Gets the end time.
   *
   * @return the end time
   */
  public Instant getEndTime() {
    return endTime;
  }

  /**
   * Sets the end time.
   *
   * @param endTime the end time to set
   */
  public void setEndTime(final Instant endTime) {
    this.endTime = endTime;
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
   * @param totalCapacity the total capacity to set
   */
  public void setTotalCapacity(final int totalCapacity) {
    this.totalCapacity = totalCapacity;
  }

  /**
   * Gets the remaining capacity.
   *
   * @return the remaining capacity
   */
  public int getRemainingCapacity() {
    return remainingCapacity;
  }

  /**
   * Sets the remaining capacity.
   *
   * @param remainingCapacity the remaining capacity to set
   */
  public void setRemainingCapacity(final int remainingCapacity) {
    this.remainingCapacity = remainingCapacity;
  }

  /**
   * Gets the booked count.
   *
   * @return the booked count
   */
  public int getBookedCount() {
    return bookedCount;
  }

  /**
   * Sets the booked count.
   *
   * @param bookedCount the booked count to set
   */
  public void setBookedCount(final int bookedCount) {
    this.bookedCount = bookedCount;
  }

  /**
   * Gets the optimistic lock version.
   *
   * @return the version
   */
  public Long getVersion() {
    return version;
  }

  /**
   * Sets the optimistic lock version.
   *
   * @param version the version to set
   */
  public void setVersion(final Long version) {
    this.version = version;
  }
}
