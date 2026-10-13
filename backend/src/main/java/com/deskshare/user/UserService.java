package com.deskshare.user;

import com.deskshare.common.exception.ConflictException;
import com.deskshare.common.exception.ResourceNotFoundException;
import com.deskshare.user.dto.CreateUserRequest;
import com.deskshare.user.dto.UserResponse;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public UserResponse createUser(CreateUserRequest request) {
    if (userRepository.existsByEmailIgnoreCase(request.email())) {
      throw new ConflictException("User already exists with email: " + request.email());
    }

    Role assignedRole = request.role() != null ? request.role() : Role.CUSTOMER;
    String encodedPassword = passwordEncoder.encode(request.password());

    User user = new User(
        request.email().toLowerCase().trim(),
        encodedPassword,
        request.firstName().trim(),
        request.lastName().trim(),
        assignedRole
    );
    user.setPhone(request.phone());

    User saved = userRepository.save(user);
    return UserResponse.fromEntity(saved);
  }

  public UserResponse getUserById(String id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    return UserResponse.fromEntity(user);
  }

  public UserResponse getUserByEmail(String email) {
    User user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    return UserResponse.fromEntity(user);
  }

  public List<UserResponse> getAllUsers() {
    return userRepository.findAll().stream()
        .map(UserResponse::fromEntity)
        .toList();
  }
}
