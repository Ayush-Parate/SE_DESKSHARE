package com.deskshare.booking;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvailabilitySlotRepository extends MongoRepository<AvailabilitySlot, String> {

  Optional<AvailabilitySlot> findBySpaceIdAndStartTime(String spaceId, Instant startTime);

  List<AvailabilitySlot> findBySpaceIdAndSlotDate(String spaceId, LocalDate slotDate);

  List<AvailabilitySlot> findBySpaceIdAndStartTimeGreaterThanEqualAndEndTimeLessThanEqual(
      String spaceId, Instant rangeStart, Instant rangeEnd);
}
