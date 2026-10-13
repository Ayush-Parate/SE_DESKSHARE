# Phase 4 — Spring Boot Skeleton & Domain Modules

## Overview

Phase 4 implements the domain modules and service architecture for the **DeskShare** modular monolith. It provides strongly-typed request/response DTOs, Bean Validation constraints, business logic service layers, REST controllers, and unified error handling across the application.

---

## 1. Domain Architecture & Packages

```
com.deskshare
├── DeskshareApiApplication.java
├── config/
│   └── SecurityConfig.java         (stateless filters, BCrypt password encoder)
├── common/
│   ├── dto/
│   │   └── ApiErrorResponse.java    (unified RFC-compliant error format)
│   └── exception/
│       ├── ResourceNotFoundException.java (404)
│       ├── ConflictException.java         (409)
│       ├── BadRequestException.java       (400)
│       └── GlobalExceptionHandler.java    (@RestControllerAdvice)
├── user/
│   ├── User.java / Role.java
│   ├── UserRepository.java
│   ├── UserService.java
│   ├── UserController.java         (/api/v1/users)
│   └── dto/
│       ├── CreateUserRequest.java
│       └── UserResponse.java
├── space/
│   ├── Space.java / SpaceType.java / Address.java
│   ├── SpaceRepository.java
│   ├── SpaceService.java
│   ├── SpaceController.java        (/api/v1/spaces)
│   └── dto/
│       ├── CreateSpaceRequest.java
│       └── SpaceResponse.java
└── booking/
    ├── Booking.java / BookingStatus.java
    ├── AvailabilitySlot.java
    ├── BookingRepository.java / AvailabilitySlotRepository.java
    ├── BookingService.java
    ├── BookingController.java      (/api/v1/bookings)
    └── dto/
        ├── CreateBookingRequest.java
        └── BookingResponse.java
```

---

## 2. API Endpoints Contract

### Users (`/api/v1/users`)
- `POST /api/v1/users`: Create user (validates email uniqueness, encodes password with BCrypt). Returns `201 Created`.
- `GET /api/v1/users/{id}`: Retrieve user details by ID. Returns `200 OK` or `404 Not Found`.
- `GET /api/v1/users`: Retrieve all registered users. Returns `200 OK`.

### Spaces (`/api/v1/spaces`)
- `POST /api/v1/spaces`: Create space with coordinates, address, and amenities. Returns `201 Created`.
- `GET /api/v1/spaces/{id}`: Retrieve space details by ID. Returns `200 OK` or `404 Not Found`.
- `GET /api/v1/spaces`: Browse all spaces.
  - Query parameters: `?ownerId={id}` or `?type={HOT_DESK|DEDICATED_DESK|PRIVATE_OFFICE|MEETING_ROOM}`.

### Bookings (`/api/v1/bookings`)
- `POST /api/v1/bookings`: Create booking. Validates time range, verifies space exists and is active, calculates duration-based pricing. Returns `201 Created`.
- `GET /api/v1/bookings/{id}`: Retrieve booking by ID. Returns `200 OK` or `404 Not Found`.
- `GET /api/v1/bookings?userId={id}`: List bookings for a customer in descending start time.
- `GET /api/v1/bookings?ownerId={id}`: List bookings for an owner's spaces.
- `PUT /api/v1/bookings/{id}/cancel`: Cancel booking and update status to `CANCELLED`. Returns `200 OK`.

---

## 3. Global Exception Handling

All controllers delegate unhandled exceptions to [`GlobalExceptionHandler`](file:///Users/ayushparate/Desktop/deskshare-SE/backend/src/main/java/com/deskshare/common/exception/GlobalExceptionHandler.java):

```json
{
  "timestamp": "2026-10-13T17:35:00Z",
  "status": 400,
  "error": "Validation Failed",
  "message": "Request body validation failed",
  "path": "/api/v1/users",
  "fieldErrors": {
    "email": "Email must be a valid email address",
    "password": "Password must be at least 8 characters long"
  }
}
```

---

## 4. Verification

All layers are verified with automated unit tests:
- Service logic tests using Mockito: `UserServiceTest`, `SpaceServiceTest`, `BookingServiceTest`.
- REST API slice tests using `@WebMvcTest`: `UserControllerTest`, `SpaceControllerTest`, `BookingControllerTest`.
- End-to-end context bootstrap test: `DeskshareApiApplicationTests` (under `setup` profile with `@MockitoBean`).
- Total: 20 passed tests, 0 failures, 0 skipped.
