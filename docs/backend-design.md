# Unmute Backend Design

## Goal

Convert the current static Unmute landing page into a working product backend for:

- session discovery
- waitlist and booking
- free and paid checkouts
- memberships
- facilitator operations
- private session access
- notifications and reminders

This design is optimized for a small team shipping fast, with room to scale later.

## Recommended Stack

### Application

- `Frontend`: keep current static site or migrate later to Next.js
- `Backend API`: Node.js + TypeScript + NestJS
- `Database`: PostgreSQL
- `Cache / queues`: Redis
- `File/object storage`: S3-compatible storage for assets only
- `Auth`: passwordless OTP / magic link
- `Payments`: Razorpay for India-first checkout and subscriptions
- `Messaging`: WhatsApp via official provider + email via Resend/SendGrid
- `Video/session layer`: Daily or Zoom SDK integration
- `Live captions`: provider integration at session runtime, not stored by default

### Why this stack

- NestJS gives clean modules for bookings, sessions, payments, and admin flows.
- PostgreSQL fits relational business data and reporting.
- Razorpay matches the India-first pricing and membership model shown on the website.
- Redis helps with temporary session tokens, reminders, idempotency, and rate limits.

## High-Level Architecture

```text
Landing Page / App
        |
        v
   API Gateway / Backend
        |
        +--> Auth Module
        +--> User Profile Module
        +--> Sessions Module
        +--> Booking Module
        +--> Payments Module
        +--> Membership Module
        +--> Notification Module
        +--> Facilitator/Admin Module
        +--> Access Module (meeting link, check-in, captions toggle)
        |
        +--> PostgreSQL
        +--> Redis
        +--> Razorpay
        +--> Email / WhatsApp Provider
        +--> Video Provider
```

## Product Flows Mapped From Current Website

### 1. Join a Circle modal

Current form fields:

- name or pseudonym
- email or WhatsApp
- selected session
- optional note

Backend actions:

1. Create or update lead record.
2. If user picked a specific session, create a booking intent.
3. If free session, confirm booking immediately if seats remain.
4. If paid session, create payment order and move booking to `pending_payment`.
5. Send confirmation or payment link.

### 2. Book a paid session

1. User selects session.
2. Backend checks capacity, booking window, and duplicate booking.
3. Backend creates booking hold for limited time, e.g. 10 minutes.
4. Razorpay order is created.
5. Webhook confirms payment.
6. Booking becomes `confirmed`.
7. Reminder notifications are scheduled.

### 3. Join free intro session

1. User submits form.
2. Backend validates capacity and basic anti-spam rules.
3. Booking becomes `confirmed`.
4. Confirmation message is sent instantly.

### 4. Monthly membership

1. User purchases `Inner Circle`.
2. Backend creates subscription customer + plan on payment provider.
3. Membership status is tracked locally.
4. Eligibility rules allow unlimited session bookings with fair-use constraints.

### 5. Facilitator operations

Facilitators need:

- create sessions
- assign themes and language
- set seat limits
- mark attendees present
- add safety notes
- send follow-ups

### 6. Private live session access

1. Before session start, backend issues short-lived access token.
2. User enters a private meeting room only if booking is `confirmed`.
3. Optional captions flag is passed to session provider.
4. No transcript is permanently stored unless policy is explicitly changed.

## Core Domains

### Users

Represents members, guests, facilitators, and admins.

### Leads

For users who submit the modal but have not completed registration or purchase.

### Sessions

Represents scheduled circles with theme, capacity, facilitator, language, pricing, and access settings.

### Bookings

Represents a user's reserved seat for one session.

### Payments

Tracks payment orders, webhook confirmations, refunds, and failures.

### Memberships

Tracks recurring plans, start/end dates, billing state, and booking benefits.

### Notifications

Email/WhatsApp reminders, confirmations, waitlist promotions, and cancellation notices.

### Session Access

Temporary meeting links, check-in status, caption preference, and attendance.

## Suggested Service Modules

### `auth`

- OTP login
- magic links
- session tokens
- role-based access

### `users`

- profile
- pseudonym
- communication preference
- accessibility preferences

### `leads`

- modal submissions
- marketing consent
- source attribution

### `sessions`

- catalog of upcoming circles
- session detail page payload
- seat availability
- waitlist

### `bookings`

- booking hold
- booking confirm/cancel
- duplicate booking prevention

### `payments`

- create order
- webhook verify
- refunds
- invoices

### `memberships`

- active plan lookup
- renewal and expiry
- benefit enforcement

### `notifications`

- confirmation messages
- reminders at `24h`, `2h`, `15m`
- cancellation and waitlist alerts

### `facilitators`

- schedule management
- attendee list
- check-in
- incident notes

### `admin`

- dashboard metrics
- manual refunds
- session analytics
- moderator and compliance tools

## API Design

Base path:

```text
/api/v1
```

### Public APIs

#### `POST /leads`

Used by landing-page modal for "Just exploring" flow.

Request:

```json
{
  "displayName": "Blue Jay",
  "contact": "priya@example.com",
  "contactType": "email",
  "selectedSessionId": null,
  "note": "Need captions",
  "source": "landing-page-modal"
}
```

#### `GET /sessions`

Return upcoming published sessions with seat availability and pricing.

#### `GET /sessions/:slug`

Return one session detail page payload.

#### `POST /bookings/intents`

Creates a booking hold.

Request:

```json
{
  "sessionId": "sess_123",
  "contact": "9999999999",
  "displayName": "Priya",
  "pricingMode": "drop_in"
}
```

Response:

```json
{
  "bookingIntentId": "bi_123",
  "bookingStatus": "pending_payment",
  "expiresAt": "2026-03-15T13:10:00Z",
  "paymentRequired": true
}
```

#### `POST /payments/orders`

Creates Razorpay order for a booking or membership.

#### `POST /payments/webhooks/razorpay`

Provider webhook endpoint. Must use signature verification and idempotency.

### Authenticated Member APIs

#### `GET /me`

Returns user profile, active membership, upcoming bookings.

#### `GET /me/bookings`

Returns current and past bookings.

#### `POST /me/bookings/:bookingId/cancel`

Member-initiated cancellation within policy.

#### `GET /me/session-access/:bookingId`

Returns short-lived meeting room link only when allowed.

### Admin / Facilitator APIs

#### `POST /admin/sessions`

Create session.

#### `PATCH /admin/sessions/:id`

Update schedule, capacity, or status.

#### `GET /admin/sessions/:id/attendees`

Return participant list and accessibility needs.

#### `POST /admin/bookings/:id/check-in`

Mark arrival.

#### `POST /admin/bookings/:id/no-show`

Mark no-show for reporting and fairness rules.

## Booking Rules

Recommended initial rules:

- one user cannot hold more than 2 unpaid booking intents at once
- booking hold expires after 10 minutes
- duplicate confirmed booking for same session is blocked
- free intro session allowed once per user/contact
- members can reserve up to 4 future sessions at once
- waitlist auto-promotes in FIFO order

## Database Model

See [database-schema.sql](/Users/ankitakant/Desktop/Shubham/GIT/Websites/docs/database-schema.sql).

Important relationships:

- one user can have many bookings
- one session can have many bookings
- one booking can have zero or many payment attempts
- one user can have many memberships over time
- one session can have one facilitator owner and optional co-facilitators later

## State Machines

### Booking status

```text
draft
-> pending_payment
-> confirmed
-> cancelled
-> waitlisted
-> attended
-> no_show
-> refunded
```

### Payment status

```text
created
-> authorized
-> captured
-> failed
-> refunded
```

### Membership status

```text
trial
-> active
-> past_due
-> cancelled
-> expired
```

## Security and Privacy

Because the product is positioned as a confidential storytelling space, privacy rules are product-critical.

### Required controls

- store minimum personal data
- encrypt sensitive contact fields at rest where possible
- hash OTP tokens and one-time access tokens
- signed webhooks
- role-based access for facilitator/admin routes
- audit logs for admin changes
- rate limiting on auth and lead endpoints
- no transcript persistence by default
- no raw video-room credentials exposed to client

### Sensitive data policy

Store:

- pseudonym/display name
- contact channel
- accessibility preferences
- booking/payment references

Avoid storing:

- session story content
- transcript text
- full crisis disclosures in plain text unless compliance policy exists

## Notification Design

### Event-driven notifications

Send notifications on:

- lead created
- booking confirmed
- payment failed
- session reminder due
- session rescheduled
- seat released from waitlist
- membership renewed

### Channels

- email for confirmation and receipts
- WhatsApp/SMS for reminders and urgent updates

## Admin Dashboard Needs

Initial metrics:

- total leads
- lead to booking conversion
- session fill rate
- no-show rate
- membership active count
- revenue by session and by plan
- waitlist conversion

Operational views:

- upcoming sessions
- attendees by session
- payment exceptions
- refund queue
- cancellation log

## Suggested Rollout

### Phase 1: MVP

- sessions catalog
- lead capture
- free + paid booking
- Razorpay one-time payments
- email confirmations
- facilitator session management

### Phase 2

- memberships
- waitlist auto-promotion
- WhatsApp reminders
- member dashboard

### Phase 3

- in-app session access
- caption preference propagation
- richer admin analytics
- community/forum features

## Recommended Folder Structure

```text
backend/
  src/
    modules/
      auth/
      users/
      leads/
      sessions/
      bookings/
      payments/
      memberships/
      notifications/
      facilitators/
      admin/
    common/
    config/
    workers/
  prisma/
  test/
```

## Practical Notes For This Website

The current landing page hardcodes sessions in HTML. Backend integration should replace these with data from `GET /sessions`.

The modal currently only shows a toast. It should be changed to:

1. submit to `POST /leads` or `POST /bookings/intents`
2. show validation and seat availability
3. redirect to checkout if payment is needed
4. show confirmed state if free booking succeeds

## Final Recommendation

If we start building now, the fastest stable path is:

1. NestJS API
2. PostgreSQL
3. Razorpay
4. Redis
5. email first, WhatsApp second

This keeps the system simple, India-friendly, and well aligned with the flows already visible on the site.
