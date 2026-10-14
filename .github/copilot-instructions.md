# Copilot instructions for DeskShare

This repository is a modular monolith with an Angular frontend, a Spring Boot backend, and MongoDB. Follow the project-specific guidance in `.agent-context/*.md` before making changes. Those files are the working source of truth for current state, decisions, and task history.

## Build, test, and validation commands

### Backend (Spring Boot / Java)

- Full suite:
  - `cd backend && ./mvnw test`
- Single test class:
  - `cd backend && ./mvnw -Dtest=AuthControllerTest test`
  - `cd backend && ./mvnw -Dtest=SpaceServiceTest test`
  - `cd backend && ./mvnw -Dtest=BookingServiceTest test`
- Run with setup profile when Mongo is not available locally:
  - `cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=setup`
- App boot with Mongo (when Docker or a Mongo replica set is available):
  - `cd backend && ./mvnw spring-boot:run`

### Frontend (Angular)

- Install dependencies:
  - `cd frontend && npm install`
- Local dev server:
  - `cd frontend && npm start`
- Production build:
  - `cd frontend && npm run build`
- Single browser test run:
  - `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`

There is no repo-local lint script in `frontend/package.json` and no Maven checkstyle/spotless plugin in `backend/pom.xml`; treat `mvn test` and `npm run build` as the primary validation commands.

## High-level architecture

- Frontend: `frontend/src/app` is the Angular SPA shell. The app is organized around `core`, `shared`, and `features` folders, with `app.routes.ts` and `app.config.ts` wiring the shell.
- Backend: `backend/src/main/java/com/deskshare` is the API layer. Domain packages are organized by feature rather than by layering only:
  - `auth` for JWT auth and security
  - `user` for customer/owner/admin user models and APIs
  - `space` for inventory and pricing flows
  - `booking` for reservation, availability slots, and pricing rules
  - `config` for Spring security and application configuration
  - `common` for cross-cutting error handling and shared DTOs/exceptions
  - `web` for public endpoints such as health
- Persistence: MongoDB is the data store; replica-set mode is required for transactions. The project expects the database to be started via `docker-compose.yml` when available.
- API boundary: the Angular app talks to REST endpoints under `/api/v1`.
- Security model: JWT-based auth with Spring Security and RBAC is already implemented; protect routes and role checks with the domain conventions already in the security config and controllers.

## Key conventions and repository-specific patterns

- Follow the modular-monolith boundaries: keep feature logic in its domain package (`auth`, `user`, `space`, `booking`) instead of creating ad hoc cross-cutting packages.
- Prefer DTOs and domain responses over exposing entities directly from controllers. The project already uses request/response classes and centralized exception handling via `common`.
- Preserve the existing error-envelope pattern: controller/service exceptions should be translated through the common exception handler and `ApiErrorResponse`, not ad hoc `RuntimeException` responses.
- Keep MongoDB domain objects aligned to the schema and booking rules already modeled in the `booking` and `space` modules. Capacity and slot logic is part of the domain rules; do not bypass validation by writing custom logic in controllers.
- Treat timestamps as UTC and use the existing reservation/slot logic for conflict prevention. The booking flow is built around availability-slot capacity checks and transaction-safe writes.
- When MongoDB is not available on a local machine, use the `setup` Spring profile for smoke tests and app startup; do not assume a live replica set is present.
- This repository includes operating docs in `docs/` and agent notes in `.agent-context/`. Use those docs and the current project state before making architectural or dependency changes.
- Frontend formatting follows the package-level Prettier settings in `frontend/package.json` (`singleQuote: true`, `printWidth: 100`) and Angular conventions for template files.

## Related repository instructions

- Read `.agent-context/AGENT_RULES.md`, `PROJECT_CONTEXT.md`, `TASKS.md`, `DECISIONS.md`, and `HANDOFF.md` before significant work.
- Preserve existing uncommitted work and avoid architecture/dependency changes without a clear, justified reason.
- Do not commit secrets or include real `.env` values.
- The project README and docs are the source for the intended stack and constraints; keep Spring Boot on the 3.5.x line unless an explicit decision changes it.
