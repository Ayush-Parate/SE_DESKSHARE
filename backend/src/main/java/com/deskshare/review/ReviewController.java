package com.deskshare.review;

import com.deskshare.auth.security.UserPrincipal;
import com.deskshare.review.dto.CreateReviewRequest;
import com.deskshare.review.dto.ReviewResponse;
import com.deskshare.review.dto.SpaceReviewsSummary;
import com.deskshare.user.User;
import com.deskshare.user.UserRepository;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/spaces/{spaceId}/reviews")
public class ReviewController {

  private final ReviewService reviewService;
  private final UserRepository userRepository;

  public ReviewController(ReviewService reviewService, UserRepository userRepository) {
    this.reviewService = reviewService;
    this.userRepository = userRepository;
  }

  @GetMapping
  public ResponseEntity<SpaceReviewsSummary> getReviews(@PathVariable String spaceId) {
    return ResponseEntity.ok(reviewService.getReviewsSummary(spaceId));
  }

  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ReviewResponse> createReview(
      @PathVariable String spaceId,
      Authentication authentication,
      @Valid @RequestBody CreateReviewRequest request) {

    String userId;
    String authorName;

    if (authentication.getPrincipal() instanceof UserPrincipal up) {
      userId = up.getId();
      authorName = userRepository.findById(userId)
          .map(u -> (u.getFirstName() + " " + u.getLastName()).trim())
          .filter(name -> !name.isEmpty())
          .orElse(up.getUsername());
    } else {
      String username = authentication.getName();
      User user = userRepository.findByEmailIgnoreCase(username).orElse(null);
      if (user != null) {
        userId = user.getId();
        authorName = (user.getFirstName() + " " + user.getLastName()).trim();
      } else {
        userId = username;
        authorName = username;
      }
    }

    ReviewResponse response = reviewService.createOrUpdateReview(spaceId, userId, authorName, request);
    return ResponseEntity.created(URI.create("/api/v1/spaces/" + spaceId + "/reviews/" + response.id()))
        .body(response);
  }
}
