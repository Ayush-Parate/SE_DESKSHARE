# Phase 1 — Requirements

## Problem statement

Coworking providers need a reliable way to list inventory (hot desks, dedicated desks, private offices, meeting rooms) and accept bookings without double-booking. Customers need to discover spaces, check availability, and book in a few steps. Platform operators need oversight of users, spaces, and bookings.

## Proposed solution

**DeskShare** is a modular-monolith web application:

- **Angular SPA** for discovery, booking, and role-specific dashboards
- **Spring Boot REST API** for auth, catalog, availability, and bookings
- **MongoDB** (replica set) for documents and multi-document transactions

## Objectives

1. Let customers register, search spaces, check availability, and create bookings.
2. Let owners manage their spaces and view booking/revenue summaries.
3. Let admins manage platform-wide users, spaces, and bookings.
4. Prevent double-bookings via atomic slot counters and MongoDB transactions.
5. Secure all mutating operations with JWT and role-based access control.

## Functional requirements (MVP)

| ID | Requirement |
|----|-------------|
| FR-1 | User registration and login with JWT (access token ~1 hour) |
| FR-2 | Role-based access: Customer, Owner, Admin |
| FR-3 | Owners create/update/list their coworking spaces and room types |
| FR-4 | Customers search/filter spaces (location, type, price, amenities) |
| FR-5 | Real-time availability check for a date/time window |
| FR-6 | Atomic booking create/cancel (no double-bookings) |
| FR-7 | Customer dashboard: upcoming and past bookings |
| FR-8 | Owner dashboard: bookings and basic revenue totals |
| FR-9 | Admin dashboard: users, spaces, bookings oversight |
| FR-10 | All timestamps stored in UTC; convert at API/UI edges |

## Non-functional requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | API response for common reads under ~500ms locally with indexes |
| NFR-2 | Booking creation must be conflict-safe under concurrent requests |
| NFR-3 | Passwords hashed (BCrypt); secrets never committed |
| NFR-4 | CORS restricted to known frontend origins |
| NFR-5 | Application modular-monolith: clear packages, single deployable API |
| NFR-6 | MongoDB must run as a replica set (even single-node) for transactions |

## Constraints

- Java 21 LTS, Spring Boot 3.5.x, Angular 20+, Node 22+ LTS preferred
- MongoDB 8.0 with replica set
- No microservices split in MVP
- No payment gateway in MVP (bookings are reservations only)
