package com.deskshare.user;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserModelTest {

  @Test
  @DisplayName("User defaults and setters function correctly")
  void testUserInstantiation() {
    User user = new User("alice@example.com", "hashed_pw", "Alice", "Smith", Role.CUSTOMER);

    assertThat(user.getEmail()).isEqualTo("alice@example.com");
    assertThat(user.getPasswordHash()).isEqualTo("hashed_pw");
    assertThat(user.getFirstName()).isEqualTo("Alice");
    assertThat(user.getLastName()).isEqualTo("Smith");
    assertThat(user.getRole()).isEqualTo(Role.CUSTOMER);
    assertThat(user.isActive()).isTrue();
    assertThat(user.getCreatedAt()).isNotNull();

    user.setRole(Role.OWNER);
    user.setPhone("+1234567890");
    assertThat(user.getRole()).isEqualTo(Role.OWNER);
    assertThat(user.getPhone()).isEqualTo("+1234567890");
  }
}
