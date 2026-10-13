package com.deskshare.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.deskshare.common.exception.ConflictException;
import com.deskshare.common.exception.ResourceNotFoundException;
import com.deskshare.user.dto.CreateUserRequest;
import com.deskshare.user.dto.UserResponse;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  private UserService userService;

  @BeforeEach
  void setUp() {
    userService = new UserService(userRepository, passwordEncoder);
  }

  @Test
  @DisplayName("createUser succeeds when email is unique")
  void testCreateUserSuccess() {
    CreateUserRequest request = new CreateUserRequest(
        "john@example.com", "Password123!", "John", "Doe", "+123456789", Role.CUSTOMER);

    when(userRepository.existsByEmailIgnoreCase("john@example.com")).thenReturn(false);
    when(passwordEncoder.encode("Password123!")).thenReturn("encoded_pass");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
      User user = invocation.getArgument(0);
      user.setId("user_123");
      return user;
    });

    UserResponse response = userService.createUser(request);

    assertThat(response.id()).isEqualTo("user_123");
    assertThat(response.email()).isEqualTo("john@example.com");
    assertThat(response.firstName()).isEqualTo("John");
    assertThat(response.role()).isEqualTo(Role.CUSTOMER);
    verify(userRepository).save(any(User.class));
  }

  @Test
  @DisplayName("createUser throws ConflictException if email exists")
  void testCreateUserEmailExists() {
    CreateUserRequest request = new CreateUserRequest(
        "duplicate@example.com", "Password123!", "John", "Doe", null, Role.CUSTOMER);

    when(userRepository.existsByEmailIgnoreCase("duplicate@example.com")).thenReturn(true);

    assertThatThrownBy(() -> userService.createUser(request))
        .isInstanceOf(ConflictException.class)
        .hasMessageContaining("User already exists with email");
  }

  @Test
  @DisplayName("getUserById throws ResourceNotFoundException when user is not found")
  void testGetUserByIdNotFound() {
    when(userRepository.findById("non_existent")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> userService.getUserById("non_existent"))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("User not found with id: 'non_existent'");
  }
}
