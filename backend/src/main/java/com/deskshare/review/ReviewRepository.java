package com.deskshare.review;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

  List<Review> findBySpaceIdOrderByCreatedAtDesc(String spaceId);

  Optional<Review> findBySpaceIdAndUserId(String spaceId, String userId);

  boolean existsBySpaceIdAndUserId(String spaceId, String userId);

  long countBySpaceId(String spaceId);
}
