package com.deskshare.review;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.deskshare.common.exception.ResourceNotFoundException;
import com.deskshare.review.dto.CreateReviewRequest;
import com.deskshare.review.dto.ReviewResponse;
import com.deskshare.review.dto.SpaceReviewsSummary;
import com.deskshare.space.SpaceRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

  @Mock
  private ReviewRepository reviewRepository;

  @Mock
  private SpaceRepository spaceRepository;

  private ReviewService reviewService;

  @BeforeEach
  void setUp() {
    reviewService = new ReviewService(reviewRepository, spaceRepository);
  }

  @Test
  @DisplayName("createOrUpdateReview creates new review if none exists")
  void testCreateNewReview() {
    when(spaceRepository.existsById("s1")).thenReturn(true);
    when(reviewRepository.findBySpaceIdAndUserId("s1", "u1")).thenReturn(Optional.empty());
    when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
      Review r = inv.getArgument(0);
      r.setId("r1");
      return r;
    });

    CreateReviewRequest req = new CreateReviewRequest(5, "Amazing workspace, very quiet!");
    ReviewResponse response = reviewService.createOrUpdateReview("s1", "u1", "Alex Customer", req);

    assertThat(response.id()).isEqualTo("r1");
    assertThat(response.spaceId()).isEqualTo("s1");
    assertThat(response.userId()).isEqualTo("u1");
    assertThat(response.authorName()).isEqualTo("Alex Customer");
    assertThat(response.rating()).isEqualTo(5);
    assertThat(response.comment()).isEqualTo("Amazing workspace, very quiet!");
    verify(reviewRepository).save(any(Review.class));
  }

  @Test
  @DisplayName("createOrUpdateReview updates review when user already reviewed the space")
  void testUpdateExistingReview() {
    when(spaceRepository.existsById("s1")).thenReturn(true);
    Review existing = new Review("s1", "u1", "Old Name", 3, "Decent place");
    existing.setId("r1");
    when(reviewRepository.findBySpaceIdAndUserId("s1", "u1")).thenReturn(Optional.of(existing));
    when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

    CreateReviewRequest req = new CreateReviewRequest(4, "Updated: It got much better!");
    ReviewResponse response = reviewService.createOrUpdateReview("s1", "u1", "Alex Updated", req);

    assertThat(response.id()).isEqualTo("r1");
    assertThat(response.rating()).isEqualTo(4);
    assertThat(response.comment()).isEqualTo("Updated: It got much better!");
    assertThat(response.authorName()).isEqualTo("Alex Updated");
  }

  @Test
  @DisplayName("createOrUpdateReview throws ResourceNotFoundException if space not found")
  void testCreateReviewSpaceNotFound() {
    when(spaceRepository.existsById("missing_space")).thenReturn(false);

    CreateReviewRequest req = new CreateReviewRequest(5, "Great place");
    assertThatThrownBy(() -> reviewService.createOrUpdateReview("missing_space", "u1", "Alex", req))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Space not found with id: 'missing_space'");
  }

  @Test
  @DisplayName("getReviewsSummary returns average rating and review list")
  void testGetReviewsSummary() {
    when(spaceRepository.existsById("s1")).thenReturn(true);
    Review r1 = new Review("s1", "u1", "Alex", 5, "Great!");
    r1.setId("r1");
    Review r2 = new Review("s1", "u2", "Sam", 4, "Good!");
    r2.setId("r2");
    when(reviewRepository.findBySpaceIdOrderByCreatedAtDesc("s1")).thenReturn(List.of(r1, r2));

    SpaceReviewsSummary summary = reviewService.getReviewsSummary("s1");

    assertThat(summary.spaceId()).isEqualTo("s1");
    assertThat(summary.averageRating()).isEqualTo(4.5);
    assertThat(summary.reviewCount()).isEqualTo(2);
    assertThat(summary.reviews()).hasSize(2);
    assertThat(summary.reviews().get(0).authorName()).isEqualTo("Alex");
  }

  @Test
  @DisplayName("getReviewsSummary returns 0.0 rating when space has no reviews")
  void testGetReviewsSummaryEmpty() {
    when(spaceRepository.existsById("s1")).thenReturn(true);
    when(reviewRepository.findBySpaceIdOrderByCreatedAtDesc("s1")).thenReturn(List.of());

    SpaceReviewsSummary summary = reviewService.getReviewsSummary("s1");

    assertThat(summary.averageRating()).isEqualTo(0.0);
    assertThat(summary.reviewCount()).isEqualTo(0);
    assertThat(summary.reviews()).isEmpty();
  }
}
