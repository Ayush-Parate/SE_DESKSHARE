package com.deskshare.review;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.deskshare.config.SecurityConfig;
import com.deskshare.config.SecurityTestConfig;
import com.deskshare.review.dto.CreateReviewRequest;
import com.deskshare.review.dto.ReviewResponse;
import com.deskshare.review.dto.SpaceReviewsSummary;
import com.deskshare.user.Role;
import com.deskshare.user.User;
import com.deskshare.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = ReviewController.class)
@Import({SecurityConfig.class, SecurityTestConfig.class})
class ReviewControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private ReviewService reviewService;

  @MockitoBean
  private UserRepository userRepository;

  @Test
  @DisplayName("GET /api/v1/spaces/{spaceId}/reviews is public and returns summary")
  void testGetReviewsPublic() throws Exception {
    ReviewResponse review = new ReviewResponse(
        "r1", "s1", "u1", "Alex C", 5, "Super nice desks!", Instant.now()
    );
    SpaceReviewsSummary summary = new SpaceReviewsSummary("s1", 5.0, 1, List.of(review));

    when(reviewService.getReviewsSummary("s1")).thenReturn(summary);

    mockMvc.perform(get("/api/v1/spaces/s1/reviews"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.spaceId").value("s1"))
        .andExpect(jsonPath("$.averageRating").value(5.0))
        .andExpect(jsonPath("$.reviewCount").value(1))
        .andExpect(jsonPath("$.reviews[0].authorName").value("Alex C"));
  }

  @Test
  @DisplayName("POST /api/v1/spaces/{spaceId}/reviews without auth returns 401")
  void testCreateReviewUnauthenticated() throws Exception {
    CreateReviewRequest request = new CreateReviewRequest(5, "Great space");

    mockMvc.perform(post("/api/v1/spaces/s1/reviews")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @WithMockUser(username = "alex@test.com", roles = "CUSTOMER")
  @DisplayName("POST /api/v1/spaces/{spaceId}/reviews with auth creates review")
  void testCreateReviewAuthenticated() throws Exception {
    User user = new User("alex@test.com", "hash", "Alex", "Customer", Role.CUSTOMER);
    user.setId("u100");
    when(userRepository.findByEmailIgnoreCase("alex@test.com")).thenReturn(Optional.of(user));

    ReviewResponse response = new ReviewResponse(
        "r100", "s1", "u100", "Alex Customer", 5, "Loved the monitor setup!", Instant.now()
    );
    when(reviewService.createOrUpdateReview(eq("s1"), eq("u100"), eq("Alex Customer"), any(CreateReviewRequest.class)))
        .thenReturn(response);

    CreateReviewRequest request = new CreateReviewRequest(5, "Loved the monitor setup!");

    mockMvc.perform(post("/api/v1/spaces/s1/reviews")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("r100"))
        .andExpect(jsonPath("$.rating").value(5))
        .andExpect(jsonPath("$.authorName").value("Alex Customer"));
  }

  @Test
  @WithMockUser(username = "alex@test.com", roles = "CUSTOMER")
  @DisplayName("POST /api/v1/spaces/{spaceId}/reviews with rating > 5 returns 400")
  void testCreateReviewValidationFailure() throws Exception {
    CreateReviewRequest request = new CreateReviewRequest(6, "Invalid rating");

    mockMvc.perform(post("/api/v1/spaces/s1/reviews")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }
}
