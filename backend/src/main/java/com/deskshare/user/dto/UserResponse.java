package com.deskshare.user.dto;

import com.deskshare.user.Role;
import com.deskshare.user.User;
import java.time.Instant;

public record UserResponse(
    String id,
    String email,
    String firstName,
    String lastName,
    String phone,
    Role role,
    boolean active,
    Instant createdAt
) {

  public static UserResponse fromEntity(User user) {
    return new UserResponse(
        user.getId(),
        user.getEmail(),
        user.getFirstName(),
        user.getLastName(),
        user.getPhone(),
        user.getRole(),
        user.isActive(),
        user.getCreatedAt()
    );
  }
}
