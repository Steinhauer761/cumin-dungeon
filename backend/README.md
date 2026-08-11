# Cum IN Dungeon backend foundation

The current site is a vanilla HTML/JavaScript Vercel deployment. This branch adds the first backend layer without changing the existing front end.

## Current foundation

- `api/health.ts` provides a Vercel serverless health endpoint at `/api/health`.
- `backend/schema.sql` defines the initial PostgreSQL data model for users, age-verification provider references, memberships, rooms, performer profiles, room sessions, transactions, and audit events.

## Planned wiring

1. Choose the production PostgreSQL provider and configure server-side environment variables.
2. Add authentication and secure HttpOnly session handling.
3. Connect the age-verification provider and retain provider references, not raw identity documents.
4. Add membership/billing webhooks and persist subscription state.
5. Connect the lobby UI to room/session APIs.
6. Add moderation, audit logging, and role-based access control before opening the service to real users.

No secrets belong in this repository. Provider keys and database credentials must stay in Vercel environment variables.
