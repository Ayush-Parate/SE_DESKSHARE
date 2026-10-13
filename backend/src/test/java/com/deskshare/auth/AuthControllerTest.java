package com.deskshare.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.deskshare.auth.dto.AuthResponse;
import com.deskshare.auth.dto.LoginRequest;
import com.deskshare.auth.dto.RegisterRequest;
import com.deskshare.config.SecurityConfig;
import com.deskshare.config.SecurityTestConfig;
import com.deskshare.user.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, SecurityTestConfig.class})
class AuthControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private AuthService authService;

  @Test
  @DisplayName("POST /api/v1/auth/register creates user and returns 201 with auth response")
  void testRegister() throws Exception {
    RegisterRequest request = new RegisterRequest(
        "test@example.com", "Password123!", "Jane", "Doe", null, Role.CUSTOMER);
    AuthResponse response = new AuthResponse(
        "token_123", "Bearer", 3600000L, "u1", "test@example.com", "Jane", "Doe", Role.CUSTOMER);

    when(authService.register(any(RegisterRequest.class))).thenReturn(response);

    mockMvc.perform(post("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.accessToken").value("token_123"))
        .andExpect(jsonPath("$.userId").value("u1"))
        .andExpect(jsonPath("$.email").value("test@example.com"))
        .andExpect(jsonPath("$.role").value("CUSTOMER"));
  }

  @Test
  @DisplayName("POST /api/v1/auth/login authenticates user and returns token")
  void testLogin() throws Exception {
    LoginRequest request = new LoginRequest("test@example.com", "Password123!");
    AuthResponse response = new AuthResponse(
        "token_123", "Bearer", 3600000L, "u1", "test@example.com", "Jane", "Doe", Role.CUSTOMER);

    when(authService.login(any(LoginRequest.class))).thenReturn(response);

    mockMvc.perform(post("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").value("token_123"))
        .andExpect(jsonPath("$.userId").value("u1"));
  }

  @Test
  @DisplayName("POST /api/v1/auth/register validates invalid request body")
  void testRegisterValidationFailure() throws Exception {
    RegisterRequest invalid = new RegisterRequest(
        "invalid-email", "short", "", "", null, null);

    mockMvc.perform(post("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(invalid)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fieldErrors.email").exists())
        .andExpect(jsonPath("$.fieldErrors.password").exists());
  }
}
