# Unmute Backend

Minimal TypeScript backend for the Unmute landing page.

## What is included

- `GET /health`
- `GET /api/v1/sessions`
- `POST /api/v1/leads`
- `POST /api/v1/bookings/intents`
- `POST /api/v1/payments/orders`
- `POST /api/v1/payments/webhooks/razorpay`

## Current implementation

- Uses Fastify for HTTP APIs
- Starts with in-memory storage so the frontend can be integrated quickly
- Matches the flows defined in `../docs/backend-design.md`
- Ready to evolve into PostgreSQL using `../docs/database-schema.sql`

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

## Frontend integration

1. Replace hardcoded session cards with `GET /api/v1/sessions`
2. Submit the modal form to `POST /api/v1/bookings/intents`
3. If `paymentRequired` is `true`, call `POST /api/v1/payments/orders`
4. If `paymentRequired` is `false`, show the confirmation payload directly

## Notes

- Payment order creation is mocked for now, but the API shape is ready for Razorpay wiring.
- Because this machine currently does not have Node.js installed, the backend could not be run inside this turn.
