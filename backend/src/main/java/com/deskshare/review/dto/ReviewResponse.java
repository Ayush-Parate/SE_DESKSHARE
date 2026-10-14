package com.deskshare.review.dto;

import com.deskshare.review.Review;
import java.time.Instant;

public record ReviewResponse(
    String id,
    String spaceId,
    String userId,
    String authorName,
    int rating,
    String comment,
    Instant createdAt
) {
  public static ReviewResponse fromEntity(Review review) {
    return new ReviewResponse(
        review.getId(),
        review.getSpaceId(),
        review.getUserId(),
        review.getAuthorName(),
        review.getRating(),
        review.getComment(),
        review.getCreatedAt()
    );
  }
}
