# Phase 5 — Authentication & Security (JWT & Spring Security)

## Overview

Phase 5 implements stateless token-based authentication using **JSON Web Tokens (JJWT 0.12.6)** and **Spring Security 6.x** in the **DeskShare** modular monolith. It enables user registration and login, password hashing with BCrypt, role-based authorization (RBAC), and protected endpoint enforcement.

---

## 1. Security Architecture & Components

```
com.deskshare
├── auth/
│   ├── AuthService.java                  (registration and login business logic)
│   ├── AuthController.java               (POST /api/v1/auth/register, /api/v1/auth/login)
│   ├── dto/
│   │   ├── RegisterRequest.java          (validated registration payload)
│   │   ├── LoginRequest.java             (validated login payload)
│   │   └── AuthResponse.java             (JWT access token, expiration, user info)
│   └── security/
│       ├── UserPrincipal.java            (UserDetails implementation with Role authorities)
│       ├── CustomUserDetailsService.java (loads user principal by email/id from UserRepository)
│       ├── JwtTokenProvider.java         (HMAC-SHA256 JWT generation, parser, and validator)
│       ├── JwtAuthenticationFilter.java  (OncePerRequestFilter parsing Bearer token)
│       └── JwtAuthenticationEntryPoint.java (Returns 401 ApiErrorResponse upon auth failure)
└── config/
    └── SecurityConfig.java               (stateless SecurityFilterChain, DaoAuthenticationProvider, BCrypt)
```

---

## 2. Authentication Flow & Endpoints

### Registration: `POST /api/v1/auth/register`
- Validates request payload (`email`, `password` min 8 chars, `firstName`, `lastName`).
- Verifies email uniqueness in MongoDB (`UserRepository.existsByEmailIgnoreCase`).
- Hashes password using `BCryptPasswordEncoder`.
- Persists user document and creates JWT access token signed with HMAC-SHA256 (`app.jwt.secret`).
- Returns HTTP `201 Created` with `AuthResponse`.

### Login: `POST /api/v1/auth/login`
- Authenticates credentials via Spring Security `AuthenticationManager`.
- Generates 1-hour expiration JWT access token containing subject (`userId`), `email`, and `role`.
- Returns HTTP `200 OK` with `AuthResponse`.

### Token Structure
- **Algorithm:** HMAC-SHA256 (`io.jsonwebtoken.security.Keys`)
- **Claims:**
  - `sub`: User ID
  - `email`: User email address
  - `role`: Role string (`CUSTOMER`, `OWNER`, `ADMIN`)
  - `iat`: Issued timestamp
  - `exp`: Expiration timestamp (default: 3600000ms / 1 hour)

---

## 3. Role-Based Access Control (RBAC) Rules

Configured in `SecurityConfig.java`:

| Endpoint Pattern | Method | Access Rule | Description |
|---|---|---|---|
| `/actuator/**`, `/api/v1/health` | GET | `permitAll()` | Public health and monitoring |
| `/api/v1/auth/**` | POST | `permitAll()` | User registration and login |
| `/api/v1/spaces/**` | GET | `permitAll()` | Public workspace catalog browsing |
| `/api/v1/spaces/**` | POST | `hasAnyRole('OWNER', 'ADMIN')` | Space inventory creation |
| `/api/v1/users` | GET | `hasRole('ADMIN')` | Platform user administration |
| `/api/v1/users/**` | GET/POST | `authenticated()` | Authenticated user profile retrieval |
| `/api/v1/bookings/**` | ANY | `authenticated()` | Booking creation, cancellation, query |

---

## 4. Verification & Testing

- **`JwtTokenProviderTest`:** Unit tests verifying token generation, validity parsing, claim extraction, and rejection of invalid signatures.
- **`AuthServiceTest`:** Unit tests verifying registration uniqueness, BCrypt hashing, credential validation, and JWT issuing.
- **`AuthControllerTest`:** WebMvc slice tests for `/api/v1/auth/register` and `/api/v1/auth/login`, verifying HTTP 201/200 and validation error responses.
- **Controller Slice Tests:** `UserControllerTest`, `SpaceControllerTest`, `BookingControllerTest`, and `HealthControllerTest` verified with Spring Security JWT filter and mock authenticated principals (`@WithMockUser`).
- **Complete Test Suite:** 28 passing backend tests, 0 failures, 0 skipped.
