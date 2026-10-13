# Phase 2 — Technology Setup

## Verified local toolchain (2026-10-13)

| Tool | Required | Observed on this machine |
|------|----------|--------------------------|
| Java | 21 LTS | OpenJDK Temurin 21.0.12.1 |
| Node.js | 22 LTS preferred | v26.10.0 (compatible for Angular CLI) |
| npm | — | 11.19.1 |
| Maven | 3.9+ | Installed via Homebrew for wrapper bootstrap |
| Angular CLI | 20+ | Via `npx` / project local CLI |
| MongoDB | 8.0 replica set | Not installed locally; use Docker Compose when Docker is available |
| Docker | Optional | Not installed on this machine |

## Stack choices

| Layer | Choice | Notes |
|-------|--------|-------|
| Backend | Spring Boot **3.5.7** / Java 21 | Matches README 3.5.x; start.spring.io now only offers 4.x |
| Frontend | Angular **20+** + Angular Material | Reactive forms, RxJS |
| Database | MongoDB 8.0 | Replica set required for transactions |
| Auth | Spring Security + JWT | Wired in later phase; Security starter present |

## How to run (after Phase 2)

```bash
# MongoDB replica set (requires Docker)
docker compose up -d

# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm start
```

Health check: `GET http://localhost:8080/actuator/health`  
API health: `GET http://localhost:8080/api/v1/health`  
App UI: `http://localhost:4200`

## Verification (2026-10-13)

| Check | Result |
|-------|--------|
| `backend ./mvnw test` (profile `setup`) | PASS |
| `frontend npm run build` | PASS |
| `GET /api/v1/health` (setup profile) | `status: UP` |
| MongoDB via Docker Compose | Not run (Docker not installed on this machine) |
