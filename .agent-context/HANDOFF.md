# Current Handoff

## Last updated
2026-10-14

## Current task
Phase 11 complete (Dashboards). The Angular frontend now has a unified /dashboard
with role-aware tabs, a SessionService with demo role switcher, and three full
role-specific dashboard views wired to the backend API.

## Verified state
- Git on branch `main`.
- Backend (phases 1–7 & 12 review backend): 44 unit/slice tests pass — `cd backend && ./mvnw test -q`.
- Frontend (phases 8–11): `npm run build` exits 0, **0 errors, 0 template warnings**.
  One expected budget warning (990 kB vs 500 kB default — Angular Material; not a code error).
- Frontend tests: `cd frontend && npm test -- --watch=false` PASS (**106/106 specs pass**).

### New/modified frontend and backend files

| File | Purpose |
|------|---------|
| `backend/.../review/*` | Review entity, repository, service, controller (POST /api/v1/spaces/{id}/reviews, GET summary & list) + 9 unit/slice tests |
| `backend/config/SecurityConfig.java` | CORS config for localhost:4200, review endpoint authorization |
| `backend/config/DemoDataSeeder.java` | Demo seeder for demo users/spaces |
| `backend/resources/application-setup.yml` | Setup profile with excludes for headless/offline testing |
| `core/services/session.service.ts` | SessionService — UserRole, SessionUser, DEMO_SESSIONS, signals, switchRole/clearSession/setSession |
| `core/services/session.service.spec.ts` | 7 Jasmine specs (test isolation fixed) |
| `core/services/deskshare-api.service.ts` | Added UserResponse, mockUsers, getUsers, getUserById, getBookingsByOwner, updateSpaceActive; SpaceFilter.ownerId; ownerId param in getSpaces/applyMockFilter |
| `features/dashboard/dashboard.component.ts` | Unified /dashboard — Mat tabs auto-select by role, tab change updates SessionService |
| `features/dashboard/dashboard.component.spec.ts` | 7 Jasmine specs |
| `features/dashboard/customer/customer-dashboard.component.ts` | Upcoming/past bookings, total spend, Book Again |
| `features/dashboard/customer/customer-dashboard.component.spec.ts` | 6 Jasmine specs |
| `features/dashboard/owner/owner-dashboard.component.ts` | Spaces with active toggle, per-space revenue, recent bookings |
| `features/dashboard/owner/owner-dashboard.component.spec.ts` | 5 Jasmine specs |
| `features/dashboard/admin/admin-dashboard.component.ts` | Stats row, tab switcher, mat-table for users/spaces/bookings |
| `features/dashboard/admin/admin-dashboard.component.spec.ts` | 9 Jasmine specs |
| `features/booking-form/booking-form.component.spec.ts` | Fixed `provideRouter` ordering so mock `ActivatedRoute` is not overridden |
| `features/space-detail/space-detail.component.spec.ts` | Fixed `provideRouter` ordering so mock `ActivatedRoute` is not overridden |
| `app.ts` | Injects SessionService, exposes roleOptions/switchRole |
| `app.html` | Dashboard nav link + role switcher matMenu |
| `app.scss` | role-btn styles |
| `app.routes.ts` | /dashboard → DashboardComponent |

## Tests and results
- `cd frontend && npm test -- --watch=false` — PASS (106/106 specs)
- `cd frontend && npm run build` — PASS (0 errors, 0 template warnings)
- `cd backend && ./mvnw test -q` — PASS (44/44 tests)

## Known issues / blockers
- Docker / local MongoDB unavailable; live integration requires Docker or remote MongoDB URI.
- `userId`/`ownerId` are demo placeholders (DEMO_USER_ID / DEMO_SESSIONS) until Phase 12 wires real JWT auth UI.
- Bundle budget warning: 990 kB initial vs 500 kB default. Not a runtime issue.

## Exact next step
**Phase 12 — Reviews and Enhancements** or **Phase 13 — Testing**

Phase 12 options (pick one or combine):
1. Space reviews — `POST /api/v1/spaces/:id/reviews` (backend needs review endpoint first), star rating, comment form, review list on SpaceDetailComponent.
2. Auth UI — login/register forms wired to `/api/v1/auth/login` + `/api/v1/auth/register`; store JWT in localStorage; replace DEMO_USER_ID with real principal.
3. Route guards — `AuthGuard` redirecting unauthenticated users away from `/dashboard` and `/bookings/new`.

Phase 13: expand the existing Jasmine specs to full coverage + add integration tests against a live MongoDB instance.
