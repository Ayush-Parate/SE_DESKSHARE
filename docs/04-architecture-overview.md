# Phase 1 — Architecture Overview

## Style

Modular monolith:

```
[ Angular SPA ] --HTTPS/JSON--> [ Spring Boot API ] --MongoDB driver--> [ MongoDB replica set ]
```

One API process, package boundaries by domain (auth, users, spaces, bookings, admin).

## Major components

| Component | Responsibility |
|-----------|----------------|
| Frontend (`frontend/`) | UI, routing, guards, forms, API client |
| Backend (`backend/`) | REST API, validation, security, business rules |
| MongoDB | Users, spaces, bookings, availability slots |
| Auth | JWT issuance/validation, RBAC |

## Booking conflict prevention (design intent)

- Availability represented as slot documents/counters per space and time bucket.
- Booking creation runs in a MongoDB transaction.
- Decrement/reserve slot only if remaining capacity > 0; otherwise fail the booking.

Detailed schema and API contracts land in Phase 3+.

## Target folder layout (Phase 2)

```
deskshare-SE/
├── backend/          # Spring Boot 3.5.x, Java 21
├── frontend/         # Angular 20+
├── docs/             # Requirements and design docs
├── docker-compose.yml
├── README.md
└── .agent-context/
```

## Environment assumptions

- Local MongoDB replica set (Docker Compose preferred when Docker is available)
- Backend default port `8080`
- Frontend default port `4200`
- Times in UTC in persistence; display conversion in UI
