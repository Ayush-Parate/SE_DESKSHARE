package com.deskshare.review;

import com.deskshare.common.exception.ResourceNotFoundException;
import com.deskshare.review.dto.CreateReviewRequest;
import com.deskshare.review.dto.ReviewResponse;
import com.deskshare.review.dto.SpaceReviewsSummary;
import com.deskshare.space.SpaceRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {

  private final ReviewRepository reviewRepository;
  private final SpaceRepository spaceRepository;

  public ReviewService(ReviewRepository reviewRepository, SpaceRepository spaceRepository) {
    this.reviewRepository = reviewRepository;
    this.spaceRepository = spaceRepository;
  }

  public ReviewResponse createOrUpdateReview(String spaceId, String userId, String authorName, CreateReviewRequest request) {
    if (!spaceRepository.existsById(spaceId)) {
      throw new ResourceNotFoundException("Space", "id", spaceId);
    }

    Review review = reviewRepository.findBySpaceIdAndUserId(spaceId, userId)
        .orElseGet(() -> new Review(spaceId, userId, authorName, request.rating(), request.comment()));

    review.setAuthorName(authorName);
    review.setRating(request.rating());
    review.setComment(request.comment());
    review.setCreatedAt(Instant.now());

    Review saved = reviewRepository.save(review);
    return ReviewResponse.fromEntity(saved);
  }

  public SpaceReviewsSummary getReviewsSummary(String spaceId) {
    if (!spaceRepository.existsById(spaceId)) {
      throw new ResourceNotFoundException("Space", "id", spaceId);
    }

    List<Review> reviews = reviewRepository.findBySpaceIdOrderByCreatedAtDesc(spaceId);
    double avg = reviews.isEmpty()
        ? 0.0
        : Math.round(reviews.stream().mapToInt(Review::getRating).average().orElse(0.0) * 10.0) / 10.0;

    List<ReviewResponse> responses = reviews.stream()
        .map(ReviewResponse::fromEntity)
        .toList();

    return new SpaceReviewsSummary(spaceId, avg, reviews.size(), responses);
  }
}
