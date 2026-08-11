# Backend API contract

This document is the implementation target for the first real backend pass. The current front end remains a prototype and should not send real personal, payment, or identity data until these endpoints are backed by production services.

## Health

`GET /api/health`

Returns a simple service status payload.

## Venue categories

`GET /api/venue/categories`

Returns active lobby categories in `sortOrder` order. Each category includes an `iconKey` so the visual artwork can be swapped without changing the category model.

## Rooms

`GET /api/rooms?category=<slug>`

Returns rooms visible to the current session, optionally filtered by category.

`GET /api/rooms/<roomId>`

Returns room metadata and current session status.

## Sessions

`POST /api/rooms/<roomId>/sessions`

Creates or schedules a room session for an authorized performer/moderator.

`POST /api/rooms/<roomId>/sessions/<sessionId>/join`

Creates a short-lived authenticated room-session authorization after membership and age-verification checks succeed.

## Membership

`GET /api/me/membership`

Returns the current membership state without exposing payment-provider secrets.

`POST /api/billing/webhook`

Receives signed billing-provider events and updates membership/transaction state idempotently.

## Creator onboarding

`POST /api/creator/application`

Creates a creator application. Identity verification should be performed by a dedicated provider. Store provider references and verification status, not raw identity documents.

## Moderation

`POST /api/rooms/<roomId>/reports`

Creates a report for moderation review.

`POST /api/rooms/<roomId>/leave`

Records a room exit and can be used to revoke the current room-session authorization.

## Security rules

- Server-side secrets only in deployment environment variables.
- Never trust category, membership, role, or verification state supplied by the browser.
- Require authenticated sessions for member-only resources.
- Require current age verification before protected adult-room access.
- Validate billing webhook signatures and make webhook processing idempotent.
- Record security-sensitive state changes in `audit_events`.
- Minimize stored identity information.
