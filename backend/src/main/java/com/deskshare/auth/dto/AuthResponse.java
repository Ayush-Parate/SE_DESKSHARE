package com.deskshare.auth.dto;

import com.deskshare.user.Role;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresInMs,
    String userId,
    String email,
    String firstName,
    String lastName,
    Role role
) {
  public static AuthResponse of(String accessToken, long expiresInMs, com.deskshare.user.User user) {
    return new AuthResponse(
        accessToken,
        "Bearer",
        expiresInMs,
        user.getId(),
        user.getEmail(),
        user.getFirstName(),
        user.getLastName(),
        user.getRole()
    );
  }
}
