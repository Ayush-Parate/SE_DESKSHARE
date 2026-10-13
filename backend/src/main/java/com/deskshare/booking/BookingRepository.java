package com.deskshare.booking;

import java.time.Instant;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

  List<Booking> findByUserIdOrderByStartTimeDesc(String userId);

  List<Booking> findByOwnerIdOrderByCreatedAtDesc(String ownerId);

  List<Booking> findBySpaceIdAndStartTimeBetween(String spaceId, Instant rangeStart, Instant rangeEnd);

  List<Booking> findBySpaceIdAndStatus(String spaceId, BookingStatus status);
}
