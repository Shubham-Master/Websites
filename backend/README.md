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
- Uses in-memory storage by default, and switches to PostgreSQL/Supabase when `DATABASE_URL` is set
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
- `DATABASE_URL`: your Supabase direct Postgres connection string
- `DATABASE_SSL`: set this to `true` for Supabase direct Postgres connections
- `RESEND_API_KEY`: optional, enables booking confirmation emails
- `EMAIL_FROM`: optional verified sender for outgoing confirmation emails
- `EMAIL_REPLY_TO`: optional reply-to address for confirmation emails

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

## Render + Vercel + Supabase

This repo is now set up for:

- frontend on Vercel
- backend on Render
- database on Supabase via direct Postgres connection

Notes:

- `../render.yaml` can create the Render backend service from this monorepo.
- On Render, `APP_URL` can fall back to `RENDER_EXTERNAL_URL` automatically.
- You still need to set `CORS_ORIGIN` to your Vercel frontend domain.
- Run `npm run db:init` once with `DATABASE_URL` set to create the schema in Supabase and seed the starter sessions.
- When `DATABASE_URL` is set, the backend uses PostgreSQL; otherwise it safely falls back to in-memory mode.
- Free-session confirmation emails are sent only when `RESEND_API_KEY` and `EMAIL_FROM` are configured.

## Notes

- Payment order creation is mocked for now, but the API shape is ready for Razorpay wiring.
- Deploy restarts are now persistent once Supabase is connected. Without `DATABASE_URL`, restarts still reset in-memory data.
- Free-session bookings still succeed even if email delivery is not configured or temporarily fails.
