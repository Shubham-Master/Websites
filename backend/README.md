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
- Production-oriented env parsing, CORS config, and graceful shutdown are now included

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

Local health checks:

- `GET /`
- `GET /health`
- `GET /healthz`

Build and run for production:

```bash
npm run build
npm run start
```

## Environment

Copy `.env.example` to `.env` and adjust these values:

- `APP_URL`: your deployed backend URL, for example `https://api.yourdomain.com`
- `CORS_ORIGIN`: your frontend domain, or multiple domains separated by commas
- `TRUST_PROXY`: set to `true` when running behind a proxy or managed load balancer
- `BOOKING_HOLD_MINUTES`: how long to reserve paid seats before payment expires

## Frontend integration

1. Deploy this backend on any Node host or container platform.
2. Set `CORS_ORIGIN` to your frontend domain.
3. Update `../app-config.js` so `apiBaseUrl` points to the deployed `/api/v1` base URL.
4. Redeploy the static frontend after the config update.

## Docker

Build the container from the `backend/` folder:

```bash
docker build -t unmute-backend .
docker run --env-file .env -p 4000:4000 unmute-backend
```

## Notes

- Payment order creation is mocked for now, but the API shape is ready for Razorpay wiring.
- Storage is still in-memory for now, so deploy restarts will reset sessions, leads, and bookings until Phase 2 adds PostgreSQL.
