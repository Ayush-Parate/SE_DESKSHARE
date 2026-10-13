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
- Phase 1 docs complete
- Phase 2 skeletons runnable; health endpoint public
- Domain schema, JWT auth, booking logic, and feature UIs not started
- Docker / local MongoDB not installed on the Phase 2 verification machine; use `setup` profile or install Docker

## Constraints
- Keep Spring Boot on 3.5.x (not 4.x) unless a documented decision changes it
- Replica set required for transactions
- Do not commit secrets; use `.env.example` patterns
- Preserve uncommitted work; verify claims with tests
