package com.deskshare.config;

import com.deskshare.auth.security.CustomUserDetailsService;
import com.deskshare.auth.security.JwtAuthenticationEntryPoint;
import com.deskshare.auth.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  DaoAuthenticationProvider authenticationProvider(CustomUserDetailsService userDetailsService,
                                                  PasswordEncoder passwordEncoder) {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder);
    return authProvider;
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
    return authConfig.getAuthenticationManager();
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http,
                                          JwtAuthenticationFilter jwtAuthenticationFilter,
                                          JwtAuthenticationEntryPoint authenticationEntryPoint,
                                          DaoAuthenticationProvider authenticationProvider) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // Health checks
            .requestMatchers("/actuator/health", "/actuator/info", "/api/v1/health").permitAll()
            // Auth endpoints
            .requestMatchers("/api/v1/auth/**").permitAll()
            // Public spaces browsing
            .requestMatchers(HttpMethod.GET, "/api/v1/spaces/**").permitAll()
            // Users endpoints: registration via auth, Admin manages users
            .requestMatchers(HttpMethod.GET, "/api/v1/users").hasRole("ADMIN")
            .requestMatchers("/api/v1/users/**").authenticated()
            // Spaces write endpoints: OWNER or ADMIN
            .requestMatchers(HttpMethod.POST, "/api/v1/spaces").hasAnyRole("OWNER", "ADMIN")
            // Bookings endpoints: must be authenticated
            .requestMatchers("/api/v1/bookings/**").authenticated()
            .anyRequest().authenticated()
        )
        .authenticationProvider(authenticationProvider)
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
