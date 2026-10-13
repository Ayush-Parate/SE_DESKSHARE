# Technical Decisions

Record confirmed decisions only. Include date, decision, reason, and consequences.

## Decisions

### 2026-10-13 — Stay on Spring Boot 3.5.x (3.5.7)
- **Decision:** Use Spring Boot **3.5.7** with Java 21, not Spring Boot 4.x.
- **Reason:** Project README targets 3.5.x; start.spring.io currently only offers 4.x, so the backend was scaffolded manually.
- **Consequences:** Aligns with planned stack; revisit Boot 4 only with an explicit migration decision.

### 2026-10-13 — `setup` Spring profile excludes Mongo autoconfig
- **Decision:** Profile `setup` excludes Mongo auto-configuration for Phase 2 smoke tests without a replica set.
- **Reason:** Docker/Mongo were unavailable on the setup machine; still needed verified API boot + tests.
- **Consequences:** Default profile still expects Mongo. Remove or narrow this profile once Phase 3+ always runs against a replica set in CI/dev.

### 2026-10-13 — Angular 20 + Material azure-blue theme
- **Decision:** Scaffold Angular 20 with Angular Material (azure-blue), HTTP client, and async animations.
- **Reason:** Matches README frontend stack for Phase 2 technology setup.
- **Consequences:** Feature modules still empty; brand shell is placeholder UI only.

### 2026-10-13 — JJWT 0.12.6 for JWT Authentication
- **Decision:** Use **JJWT** (`io.jsonwebtoken` version 0.12.6) for HMAC-SHA256 JWT generation, signing, and verification.
- **Reason:** JJWT is lightweight, modern, and integrates seamlessly with Spring Security without requiring an external OAuth2 server.
- **Consequences:** Tokens are signed using configured secret key (`app.jwt.secret`) and carry standard subject and claims (`email`, `role`).

## Pending decisions
- Exact booking slot granularity (hourly vs custom windows)
- Image storage approach for space photos (URL-only vs upload)
