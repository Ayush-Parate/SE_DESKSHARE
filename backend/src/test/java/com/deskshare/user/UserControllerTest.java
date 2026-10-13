package com.deskshare.user;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.deskshare.config.SecurityConfig;
import com.deskshare.config.SecurityTestConfig;
import com.deskshare.user.dto.CreateUserRequest;
import com.deskshare.user.dto.UserResponse;
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

@WebMvcTest(controllers = UserController.class)
@Import({SecurityConfig.class, SecurityTestConfig.class})
class UserControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private UserService userService;

  @Test
  @WithMockUser
  @DisplayName("POST /api/v1/users creates and returns user")
  void testCreateUser() throws Exception {
    CreateUserRequest request = new CreateUserRequest(
        "test@example.com", "Secret123!", "Jane", "Doe", null, Role.CUSTOMER);
    UserResponse response = new UserResponse(
        "u1", "test@example.com", "Jane", "Doe", null, Role.CUSTOMER, true, Instant.now());

    when(userService.createUser(any(CreateUserRequest.class))).thenReturn(response);

    mockMvc.perform(post("/api/v1/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("u1"))
        .andExpect(jsonPath("$.email").value("test@example.com"))
        .andExpect(jsonPath("$.role").value("CUSTOMER"));
  }

  @Test
  @WithMockUser
  @DisplayName("GET /api/v1/users/{id} returns user by id")
  void testGetUserById() throws Exception {
    UserResponse response = new UserResponse(
        "u1", "test@example.com", "Jane", "Doe", null, Role.CUSTOMER, true, Instant.now());

    when(userService.getUserById("u1")).thenReturn(response);

    mockMvc.perform(get("/api/v1/users/u1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value("u1"))
        .andExpect(jsonPath("$.firstName").value("Jane"));
  }
}
