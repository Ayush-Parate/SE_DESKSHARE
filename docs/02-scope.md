# Phase 1 — Scope

## In scope (MVP)

- Auth: register, login, JWT bearer tokens
- Roles: Customer, Owner, Admin
- Spaces: CRUD for owners; public browse/search/filter
- Space types: hot desk, dedicated desk, private office, meeting room
- Availability check for a requested window
- Booking create/list/cancel with atomic conflict prevention
- Customer, Owner, and Admin dashboards (core metrics only)
- REST API under `/api/v1`
- Angular SPA with Angular Material and reactive forms

## Out of scope (post-MVP / advanced)

- Payment processing and invoicing
- Real-time WebSocket push (availability polling is enough for MVP)
- Mobile native apps
- Multi-tenant white-label / custom domains
- Calendar sync (Google/Outlook)
- Advanced analytics and BI exports
- Chat / messaging between customers and owners
- Image CDN pipeline (simple URL or local upload can come later)
- Soft-delete audit trails beyond basic status fields
- Internationalization (i18n) beyond UTC time handling

## Success criteria for MVP

1. A customer can register, find a space, book an available slot, and see it on their dashboard.
2. Concurrent booking attempts for the last remaining slot result in exactly one success.
3. An owner can manage spaces and see related bookings/revenue summary.
4. An admin can view/manage platform entities without using the database console.
5. Backend and frontend start locally against a MongoDB replica set.

## Phase boundary

| Phase | Focus |
|-------|--------|
| 1 | Requirements and scope (this document set) |
| 2 | Technology setup (repos, tooling, runnable skeletons) |
| 3+ | Schema, API modules, auth, bookings, UI, testing, deploy |
