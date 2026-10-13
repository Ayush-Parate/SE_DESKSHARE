package com.deskshare.auth;

import com.deskshare.auth.dto.AuthResponse;
import com.deskshare.auth.dto.LoginRequest;
import com.deskshare.auth.dto.RegisterRequest;
import com.deskshare.auth.security.JwtTokenProvider;
import com.deskshare.auth.security.UserPrincipal;
import com.deskshare.common.exception.ConflictException;
import com.deskshare.user.Role;
import com.deskshare.user.User;
import com.deskshare.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtTokenProvider tokenProvider;

  public AuthService(UserRepository userRepository,
                     PasswordEncoder passwordEncoder,
                     AuthenticationManager authenticationManager,
                     JwtTokenProvider tokenProvider) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.tokenProvider = tokenProvider;
  }

  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByEmailIgnoreCase(request.email())) {
      throw new ConflictException("User already exists with email: " + request.email());
    }

    Role role = request.role() != null ? request.role() : Role.CUSTOMER;
    String encodedPassword = passwordEncoder.encode(request.password());

    User user = new User(
        request.email().toLowerCase().trim(),
        encodedPassword,
        request.firstName().trim(),
        request.lastName().trim(),
        role
    );
    user.setPhone(request.phone());

    User saved = userRepository.save(user);

    UserPrincipal principal = UserPrincipal.create(saved);
    String token = tokenProvider.generateToken(principal);

    return AuthResponse.of(token, tokenProvider.getExpirationMs(), saved);
  }

  public AuthResponse login(LoginRequest request) {
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.email().toLowerCase().trim(), request.password())
    );

    UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
    String token = tokenProvider.generateToken(principal);

    User user = userRepository.findById(principal.getId())
        .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));

    return AuthResponse.of(token, tokenProvider.getExpirationMs(), user);
  }
}
