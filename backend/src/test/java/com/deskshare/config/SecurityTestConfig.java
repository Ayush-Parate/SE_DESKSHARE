package com.deskshare.config;

import com.deskshare.auth.security.CustomUserDetailsService;
import com.deskshare.auth.security.JwtAuthenticationEntryPoint;
import com.deskshare.auth.security.JwtAuthenticationFilter;
import com.deskshare.auth.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@TestConfiguration
public class SecurityTestConfig {

  @Bean
  @Primary
  CustomUserDetailsService customUserDetailsService() {
    return new CustomUserDetailsService(null) {
      @Override
      public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return User.withUsername(email).password("password").roles("CUSTOMER").build();
      }

      @Override
      public UserDetails loadUserById(String id) {
        return User.withUsername("test@example.com").password("password").roles("CUSTOMER").build();
      }
    };
  }

  @Bean
  @Primary
  JwtTokenProvider jwtTokenProvider() {
    return new JwtTokenProvider();
  }

  @Bean
  @Primary
  JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint(ObjectMapper objectMapper) {
    return new JwtAuthenticationEntryPoint(objectMapper);
  }

  @Bean
  @Primary
  JwtAuthenticationFilter jwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                                  CustomUserDetailsService customUserDetailsService) {
    return new JwtAuthenticationFilter(jwtTokenProvider, customUserDetailsService);
  }
}
