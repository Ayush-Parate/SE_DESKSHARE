package com.deskshare.booking;

import java.time.Instant;
import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

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

  public AvailabilitySlot() {
  }

  public AvailabilitySlot(String spaceId, LocalDate slotDate, Instant startTime, Instant endTime, int totalCapacity) {
    this.spaceId = spaceId;
    this.slotDate = slotDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.totalCapacity = totalCapacity;
    this.remainingCapacity = totalCapacity;
    this.bookedCount = 0;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getSpaceId() {
    return spaceId;
  }

  public void setSpaceId(String spaceId) {
    this.spaceId = spaceId;
  }

  public LocalDate getSlotDate() {
    return slotDate;
  }

  public void setSlotDate(LocalDate slotDate) {
    this.slotDate = slotDate;
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

  public int getTotalCapacity() {
    return totalCapacity;
  }

  public void setTotalCapacity(int totalCapacity) {
    this.totalCapacity = totalCapacity;
  }

  public int getRemainingCapacity() {
    return remainingCapacity;
  }

  public void setRemainingCapacity(int remainingCapacity) {
    this.remainingCapacity = remainingCapacity;
  }

  public int getBookedCount() {
    return bookedCount;
  }

  public void setBookedCount(int bookedCount) {
    this.bookedCount = bookedCount;
  }

  public Long getVersion() {
    return version;
  }

  public void setVersion(Long version) {
    this.version = version;
  }
}
