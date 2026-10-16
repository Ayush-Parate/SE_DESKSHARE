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
3. MongoDB schema & domain entities — **done**
4. Spring Boot skeleton (domain modules) — **done**
5. Authentication & JWT security stack — **done**
6. Space management & search filters — **done**
7. Booking logic & conflict prevention — **done**
8. Angular foundation & brand shell — **done**
9. Space browsing UI & detail view — **done**
10. Booking interface & reservation form — **done**
11. Dashboards (Customer / Owner / Admin) — **done**
12. Reviews and enhancements (Auth UI & Space Reviews) — **done**
13. Testing (107 unit tests, 44 backend tests, 25 Playwright E2E tests) — **done**
14. Deployment (Dockerfiles, Nginx SPA proxy, Compose prod, CI/CD) — **done**

---

## Production Deployment (Phase 14)

Run the entire full-stack application (MongoDB replica set, Spring Boot API, and Nginx Angular SPA) with a single command:

```bash
# 1. Generate JWT secret
export JWT_SECRET=$(openssl rand -hex 32)

# 2. Build and launch all production containers
docker compose -f docker-compose.prod.yml up --build -d
```

- Application UI: `http://localhost`
- API Health: `http://localhost/api/v1/health`
- Spring Actuator: `http://localhost/actuator/health`

See [docs/09-deployment-guide.md](file:///Users/ayushparate/Desktop/deskshare-SE/docs/09-deployment-guide.md) for full deployment options, cloud hosting (AWS/DigitalOcean/Render), and backup instructions.

---

## Documentation

| Doc | Contents |
|-----|----------|
| `docs/01-requirements.md` | Problem, FRs, NFRs |
| `docs/02-scope.md` | MVP vs out of scope |
| `docs/03-roles-permissions.md` | RBAC matrix |
| `docs/04-architecture-overview.md` | Modular monolith overview |
| `docs/05-tech-setup.md` | Toolchain and run notes |
| `docs/06-mongodb-schema.md` | Collections, indexing, transactions |
| `docs/07-domain-modules-and-api-skeleton.md` | API contracts, DTOs, controllers |
| `docs/08-authentication-and-security.md` | JWT authentication stack and RBAC |
| `docs/09-deployment-guide.md` | Production deployment, Docker, CI/CD, ops |

---

## Important Notes

- **MongoDB runs as a replica set** (`rs0`) to enable multi-document transactions for booking concurrency
- The booking system uses atomic slot counters to prevent double-bookings
- All timestamps are stored in UTC and formatted at the client edge
- Authentication uses stateless HMAC-SHA256 JWT tokens with role-based route guards

