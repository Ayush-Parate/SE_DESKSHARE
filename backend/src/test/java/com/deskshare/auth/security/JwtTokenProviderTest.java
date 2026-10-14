package com.deskshare.auth.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.deskshare.user.Role;
import com.deskshare.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class JwtTokenProviderTest {

  private JwtTokenProvider jwtTokenProvider;

  @BeforeEach
  void setUp() {
    jwtTokenProvider = new JwtTokenProvider();
    ReflectionTestUtils.setField(
        jwtTokenProvider,
        "jwtSecret",
        "very-secure-256-bit-secret-key-that-is-long-enough-for-testing"
    );
    ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 3600000L);
    jwtTokenProvider.init();
  }

  @Test
  @DisplayName("generateToken generates valid token that can be parsed and verified")
  void testGenerateAndValidateToken() {
    User user = new User("user@example.com", "hash", "John", "Doe", Role.CUSTOMER);
    user.setId("u_999");
    UserPrincipal principal = UserPrincipal.create(user);

    String token = jwtTokenProvider.generateToken(principal);

    assertThat(token).isNotBlank();
    assertThat(jwtTokenProvider.validateToken(token)).isTrue();
    assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo("u_999");
  }

  @Test
  @DisplayName("validateToken returns false for invalid token")
  void testValidateTokenInvalid() {
    assertThat(jwtTokenProvider.validateToken("invalid.token.here")).isFalse();
  }

  @Test
  @DisplayName("validateToken returns false for frontend demo session tokens")
  void testValidateDemoSessionTokens() {
    boolean customer = jwtTokenProvider.validateToken("demo-token-customer");
    boolean owner = jwtTokenProvider.validateToken("demo-token-owner");
    boolean admin = jwtTokenProvider.validateToken("demo-token-admin");
    assertThat(customer).isFalse();
    assertThat(owner).isFalse();
    assertThat(admin).isFalse();
  }
}
