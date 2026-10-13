# DeskShare — Coworking Space Booking Platform

A full-stack web application for discovering, booking, and managing coworking spaces. Built with Angular, Spring Boot, and MongoDB.

---

## Overview

**DeskShare** is a modular-monolith web application for discovering, booking, and managing coworking spaces (hot desks, dedicated desks, private offices, meeting rooms).

Phase 1 (requirements/scope) and Phase 2 (technology setup) are complete. See `docs/` for details.

---

## Quick Start

### Prerequisites

- Java 21 LTS
- Node.js 22+ (22 LTS preferred)
- MongoDB 8.0 (replica set required) — Docker Compose provided
- Maven Wrapper included (`backend/mvnw`); system Maven 3.9+ optional

### Setup

```bash
# MongoDB replica set (requires Docker)
docker compose up -d

# Backend (with Mongo)
cd backend
./mvnw spring-boot:run

# Backend without Mongo (Phase 2 smoke / CI convenience)
./mvnw spring-boot:run -Dspring-boot.run.profiles=setup

# Frontend
cd ../frontend
npm install
npm start
```

- API health: `http://localhost:8080/api/v1/health`
- Actuator: `http://localhost:8080/actuator/health`
- UI: `http://localhost:4200`

---

## Technology Stack

**Frontend:** Angular 20, Angular Material, Reactive Forms, RxJS, TypeScript

**Backend:** Java 21, Spring Boot 3.5.7, Spring Data MongoDB, Spring Security, Bean Validation, Actuator

**Database:** MongoDB 8.0 (replica set required for transactions)

---

## Project Structure

```
deskshare-SE/
├── backend/          # Spring Boot API
├── frontend/         # Angular SPA
├── docs/             # Requirements and setup docs
├── docker-compose.yml
└── .agent-context/   # Shared agent working notes
```

---

## Development Phases

1. Requirements and scope definition — **done**
2. Technology setup — **done**
3. MongoDB schema
4. Spring Boot skeleton (domain modules)
5. Authentication
6. Space management
7. Booking logic (critical)
8. Angular foundation
9. Space browsing UI
10. Booking interface
11. Dashboards
12. Reviews and enhancements
13. Testing
14. Deployment

---

## Documentation

| Doc | Contents |
|-----|----------|
| `docs/01-requirements.md` | Problem, FRs, NFRs |
| `docs/02-scope.md` | MVP vs out of scope |
| `docs/03-roles-permissions.md` | RBAC matrix |
| `docs/04-architecture-overview.md` | Modular monolith overview |
| `docs/05-tech-setup.md` | Toolchain and run notes |

---

## Important Notes

- **MongoDB must run as a replica set** (even single-node) for transactions to work
- The booking system will use atomic slot counters to prevent double-bookings
- All times are stored in UTC, converted at the edges
- JWT tokens will be short-lived (1 hour) — auth lands in Phase 5

---

## Next Steps

Phase 3: MongoDB schema design (collections, indexes, transaction boundaries).
