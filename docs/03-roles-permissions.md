# Phase 1 — Roles and Permissions

## Roles

| Role | Who | Primary goal |
|------|-----|--------------|
| `CUSTOMER` | People booking desks/rooms | Discover and book spaces |
| `OWNER` | Coworking operators | List inventory and manage bookings |
| `ADMIN` | Platform operators | Oversee users, spaces, bookings |

A user has exactly one primary role in MVP. Role elevation is admin-only.

## Permission matrix (MVP)

| Action | Customer | Owner | Admin |
|--------|:--------:|:-----:|:-----:|
| Register / login | ✓ | ✓ | ✓ |
| View public spaces / search | ✓ | ✓ | ✓ |
| Check availability | ✓ | ✓ | ✓ |
| Create own booking | ✓ | — | — |
| View / cancel own booking | ✓ | — | — |
| Create / update own spaces | — | ✓ | — |
| View bookings for own spaces | — | ✓ | — |
| Owner revenue summary | — | ✓ | — |
| Manage any user | — | — | ✓ |
| Manage any space | — | — | ✓ |
| Manage any booking | — | — | ✓ |

## Auth notes

- JWT access tokens are short-lived (~1 hour).
- Protected routes require `Authorization: Bearer <token>`.
- Ownership checks apply to owner-scoped resources (space `ownerId` must match principal).
- Admins bypass ownership checks but still use authenticated endpoints.
