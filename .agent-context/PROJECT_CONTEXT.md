# Project Context

## Overview
DeskShare is a coworking space booking platform. Customers discover and book desks/rooms; owners manage inventory; admins oversee the platform. Architecture is a modular monolith (Angular SPA + Spring Boot API + MongoDB).

## Technology stack
- **Frontend:** Angular 20.3, Angular Material 20.2, TypeScript 5.9, RxJS 7.8, SCSS
- **Backend:** Java 21, Spring Boot 3.5.7, Spring Web, Spring Data MongoDB, Spring Security, Validation, Actuator
- **Database:** MongoDB 8.0 (replica set) via `docker-compose.yml`
- **Build:** Maven Wrapper 3.9.9 (`backend/mvnw`), npm / Angular CLI

## Architecture
- SPA talks to REST API under `/api/v1`
- JWT + RBAC planned (Phase 5); Phase 2 uses Spring Security with public health endpoints
- Booking conflict prevention via atomic slot counters + transactions (later phases)
- Package placeholders: `auth`, `user`, `space`, `booking`

## Key folders
- `backend/` — Spring Boot API
- `frontend/` — Angular SPA (`core/`, `shared/`, `features/` placeholders)
- `docs/` — Phase 1–2 documentation
- `docker-compose.yml` — MongoDB 8.0 replica set
- `.agent-context/` — agent rules, tasks, handoff

## Setup and commands
Verified on 2026-10-13:

```bash
# Backend tests (no Mongo required)
cd backend && ./mvnw test

# Backend smoke without Mongo
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=setup

# Frontend
cd frontend && npm install && npm start
cd frontend && npm run build
```

Mongo (when Docker available): `docker compose up -d`

## Current state
- All 14 development phases complete and verified.
- Backend: full JWT authentication, RBAC, space management, atomic booking conflict prevention, space reviews, and Actuator health endpoints (44 unit/slice tests passing).
- Frontend: Angular 20 SPA with Angular Material, auth flows (login/register/guards), space browsing/filters, booking reservations, customer/owner/admin dashboards, space reviews (107 unit tests + 25 Playwright E2E tests passing).
- Deployment: Multi-stage Dockerfiles, Nginx SPA reverse proxy, production Docker Compose (`docker-compose.prod.yml`), and GitHub Actions CI pipeline.

## Constraints
- Keep Spring Boot on 3.5.x (not 4.x) unless a documented decision changes it
- Replica set required for transactions
- Do not commit secrets; use `.env.example` patterns
- Preserve uncommitted work; verify claims with tests
