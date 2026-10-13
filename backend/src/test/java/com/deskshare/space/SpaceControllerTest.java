package com.deskshare.space;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.deskshare.config.SecurityConfig;
import com.deskshare.config.SecurityTestConfig;
import com.deskshare.space.dto.CreateSpaceRequest;
import com.deskshare.space.dto.SpaceResponse;
import com.deskshare.space.dto.UpdateSpaceRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = SpaceController.class)
@Import({SecurityConfig.class, SecurityTestConfig.class})
class SpaceControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private SpaceService spaceService;

  @Test
  @WithMockUser(roles = "OWNER")
  @DisplayName("POST /api/v1/spaces creates a space")
  void testCreateSpace() throws Exception {
    Address address = new Address("123 Tech Way", "Austin", "TX", "78701", "USA");
    CreateSpaceRequest request = new CreateSpaceRequest(
        "owner_1", "Innovation Loft", "Modern desks", address,
        -97.74, 30.26, SpaceType.HOT_DESK, 25, 1500L, 7500L,
        List.of("WIFI"), List.of("https://example.com/img.jpg"));

    SpaceResponse response = new SpaceResponse(
        "s1", "owner_1", "Innovation Loft", "Modern desks", address,
        -97.74, 30.26, SpaceType.HOT_DESK, 25, 1500L, 7500L,
        List.of("WIFI"), List.of("https://example.com/img.jpg"), true, Instant.now());

    when(spaceService.createSpace(any(CreateSpaceRequest.class))).thenReturn(response);

    mockMvc.perform(post("/api/v1/spaces")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("s1"))
        .andExpect(jsonPath("$.name").value("Innovation Loft"))
        .andExpect(jsonPath("$.totalCapacity").value(25));
  }

  @Test
  @DisplayName("GET /api/v1/spaces/{id} retrieves space by id")
  void testGetSpaceById() throws Exception {
    Address address = new Address("123 Tech Way", "Austin", "TX", "78701", "USA");
    SpaceResponse response = new SpaceResponse(
        "s1", "owner_1", "Innovation Loft", "Modern desks", address,
        -97.74, 30.26, SpaceType.HOT_DESK, 25, 1500L, 7500L,
        List.of("WIFI"), null, true, Instant.now());

    when(spaceService.getSpaceById("s1")).thenReturn(response);

    mockMvc.perform(get("/api/v1/spaces/s1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value("s1"))
        .andExpect(jsonPath("$.type").value("HOT_DESK"));
  }

  @Test
  @WithMockUser(roles = "OWNER")
  @DisplayName("PUT /api/v1/spaces/{id} updates pricing and amenities")
  void testUpdateSpace() throws Exception {
    Address address = new Address("123 Tech Way", "Austin", "TX", "78701", "USA");
    UpdateSpaceRequest request = new UpdateSpaceRequest(
        "Innovation Loft",
        "Updated description",
        address,
        -97.75,
        30.27,
        SpaceType.DEDICATED_DESK,
        30,
        2200L,
        11000L,
        List.of("WIFI", "PRINTER"),
        List.of("https://example.com/new.jpg"),
        true);

    SpaceResponse response = new SpaceResponse(
        "s1", "owner_1", "Innovation Loft", "Updated description", address,
        -97.75, 30.27, SpaceType.DEDICATED_DESK, 30, 2200L, 11000L,
        List.of("WIFI", "PRINTER"), List.of("https://example.com/new.jpg"), true, Instant.now());

    when(spaceService.updateSpace(eq("s1"), any(UpdateSpaceRequest.class))).thenReturn(response);

    mockMvc.perform(put("/api/v1/spaces/s1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value("s1"))
        .andExpect(jsonPath("$.type").value("DEDICATED_DESK"))
        .andExpect(jsonPath("$.amenities[1]").value("PRINTER"));
  }
}
