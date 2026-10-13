package com.deskshare.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.deskshare.auth.dto.AuthResponse;
import com.deskshare.auth.dto.LoginRequest;
import com.deskshare.auth.dto.RegisterRequest;
import com.deskshare.auth.security.JwtTokenProvider;
import com.deskshare.auth.security.UserPrincipal;
import com.deskshare.common.exception.ConflictException;
import com.deskshare.user.Role;
import com.deskshare.user.User;
import com.deskshare.user.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private AuthenticationManager authenticationManager;

  @Mock
  private JwtTokenProvider tokenProvider;

  @Mock
  private Authentication authentication;

  private AuthService authService;

  @BeforeEach
  void setUp() {
    authService = new AuthService(userRepository, passwordEncoder, authenticationManager, tokenProvider);
  }

  @Test
  @DisplayName("register creates user, encodes password, and returns auth response")
  void testRegisterSuccess() {
    RegisterRequest request = new RegisterRequest(
        "test@example.com", "Password123!", "Jane", "Doe", "+1234567890", Role.CUSTOMER);

    when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(false);
    when(passwordEncoder.encode(request.password())).thenReturn("hashed_pw");

    User savedUser = new User("test@example.com", "hashed_pw", "Jane", "Doe", Role.CUSTOMER);
    savedUser.setId("user_123");
    when(userRepository.save(any(User.class))).thenReturn(savedUser);
    when(tokenProvider.generateToken(any(UserPrincipal.class))).thenReturn("jwt-token-xyz");
    when(tokenProvider.getExpirationMs()).thenReturn(3600000L);

    AuthResponse response = authService.register(request);

    assertThat(response.accessToken()).isEqualTo("jwt-token-xyz");
    assertThat(response.tokenType()).isEqualTo("Bearer");
    assertThat(response.userId()).isEqualTo("user_123");
    assertThat(response.email()).isEqualTo("test@example.com");
    assertThat(response.role()).isEqualTo(Role.CUSTOMER);

    verify(userRepository).save(any(User.class));
  }

  @Test
  @DisplayName("register throws ConflictException when email is already taken")
  void testRegisterEmailConflict() {
    RegisterRequest request = new RegisterRequest(
        "existing@example.com", "Password123!", "Jane", "Doe", null, Role.CUSTOMER);

    when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(true);

    assertThatThrownBy(() -> authService.register(request))
        .isInstanceOf(ConflictException.class)
        .hasMessageContaining("User already exists with email");
  }

  @Test
  @DisplayName("login validates credentials and returns token and user info")
  void testLoginSuccess() {
    LoginRequest request = new LoginRequest("test@example.com", "Password123!");

    User user = new User("test@example.com", "hashed_pw", "Jane", "Doe", Role.CUSTOMER);
    user.setId("user_123");
    UserPrincipal principal = UserPrincipal.create(user);

    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
        .thenReturn(authentication);
    when(authentication.getPrincipal()).thenReturn(principal);
    when(tokenProvider.generateToken(principal)).thenReturn("jwt-token-xyz");
    when(tokenProvider.getExpirationMs()).thenReturn(3600000L);
    when(userRepository.findById("user_123")).thenReturn(Optional.of(user));

    AuthResponse response = authService.login(request);

    assertThat(response.accessToken()).isEqualTo("jwt-token-xyz");
    assertThat(response.userId()).isEqualTo("user_123");
    assertThat(response.email()).isEqualTo("test@example.com");
  }
}
