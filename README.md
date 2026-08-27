# Unmute

A safe, accessible storytelling community for people navigating hearing loss and rebuilding confidence — one story at a time.

🌐 **Live at:** [unmute.vercel.app](https://websites-three-azure.vercel.app/#how)

---

## What is Unmute?

Unmute hosts small, private storytelling circles (5–7 people) where members share their experiences in a judgment-free space.

- 🔴 Real-time AI captions on every session
- 🎭 Avatar mode — camera always optional
- 🔒 Zero-recording policy
- 🇮🇳 Built for India — UPI payments, Hindi/Hinglish sessions

## Local setup

The landing page now expects a real booking backend instead of silently falling back to hardcoded session cards.

1. Start the backend:
   - `cd backend`
   - `cp .env.example .env`
   - `npm install`
   - `npm run dev`
2. Keep `app-config.js` pointed at `http://localhost:4000/api/v1` for local work.
3. Serve the frontend from the repo root with any static server.

## Deploy wiring

- Edit `app-config.js` and set `apiBaseUrl` to your deployed backend URL before shipping the frontend.
- Set `CORS_ORIGIN` in `backend/.env` to your frontend domain so browser requests are allowed.
- The `api/` folder is legacy demo/mock code; the landing page now reads from `app-config.js` first for the real backend.

## Production checklist

1. Deploy `backend/` using `npm run build` and `npm run start`, or use the included Dockerfile.
2. Set backend env vars:
   - `APP_URL=https://your-backend-domain`
   - `CORS_ORIGIN=https://your-frontend-domain`
   - `TRUST_PROXY=true` when your host sits behind a proxy
3. Update `app-config.js` so `apiBaseUrl` points to `https://your-backend-domain/api/v1`
4. Redeploy the frontend
5. Verify:
   - backend health at `/health`
   - frontend sessions load successfully
   - form submits reach the backend

## Chosen stack

- Frontend: Vercel
- Backend: Render
- Database: Supabase

---

## Project Status

Last reviewed: 2026-08-27.

### ✅ Done

- **Frontend** — all 11 pages built and live (home, about, how-it-works, sessions, pricing, faq, code-of-conduct, privacy-policy, terms). Custom "Unmute" editorial design system (Fraunces + Inter, warm cream/ember palette, mood-tag pills, dark surfaces) is implemented across every page.
- **Backend API** (Fastify + TypeScript, `backend/`), deployed on Render:
  - `GET /health`, `/healthz`
  - `GET /api/v1/sessions`, `GET /api/v1/sessions/:slug` — live session catalog with real remaining-seat counts
  - `POST /api/v1/leads` — captures interest-list signups
  - `POST /api/v1/bookings/intents` — creates a booking; auto-confirms free sessions, holds paid seats, opens a waitlist when full
- **Storage** — dual-mode store: in-memory for local dev, Supabase/Postgres in production (auto-selected from `DATABASE_URL`). Schema + seed script in `docs/database-schema.sql` / `backend/src/scripts/init-db.ts`.
- **Email** — free-session booking confirmations send via Resend when `RESEND_API_KEY` + `EMAIL_FROM` are set.
- **Seed data** — starter sessions now generate rolling future dates instead of a hardcoded month, so the catalog no longer goes empty as time passes.

### 🚧 Mocked / partially built

- **Payments** — `POST /api/v1/payments/orders` and the `.../webhooks/razorpay` route exist, but they return a **fake** order ID and never call Razorpay. No real charge, signature verification, or refund flow yet. This is the top item to build next.
- **Paid-booking email** — only free-session bookings get a confirmation email today; a paid booking currently sends nothing after checkout.

### ❌ Not started

- **Google sign-in (OAuth)** — there is no login of any kind yet. What looks like "sign in" today is just the booking modal's name + email/WhatsApp form — it creates/updates a `users` row per submission, but issues no session, token, or cookie, and there's no "logged in" state anywhere on the site.
- **Persisting real account/session data** — the `users` table only stores what the booking form collects (name, email or phone, contact preference). There are no columns for an OAuth provider/provider ID, no session or refresh tokens, and no `/me` endpoint to read "who is currently logged in."
- **Member dashboard** — `GET /me`, `GET /me/bookings`, cancel-booking — designed in `docs/backend-design.md` but not built.
- **Admin / facilitator panel** — no way to create or edit a session, see attendees, or mark check-in/no-show except by hand-editing the database (this is how last week's stale-date bug was fixed).
- **Memberships** — `pricing.html` markets a monthly membership plan, but there is no backend membership record, status, or recurring billing.
- **Waitlist auto-promotion** — a `waitlistOpen` flag exists per session, but nothing automatically offers a freed seat to the next person on the list.
- **WhatsApp reminders** and any notification channel beyond the one Resend email.
- **Live session access** — `room_provider` / `room_external_id` columns exist in the schema for a future meeting-room integration, but nothing populates or serves them yet.
- **Cleanup** — `api/` at the repo root is legacy Vercel serverless mock code from before the real backend existed; it's unused by the frontend now and is safe to delete once confirmed nothing else references it.

### Suggested order for what's next

1. Real Razorpay integration (replace the mock in `backend/src/routes/payments.ts`).
2. Google OAuth sign-in + session tokens, so "logged in" becomes a real state instead of a per-submission form.
3. Paid-booking confirmation email.
4. A minimal admin view for session CRUD (removes the need to hand-edit Supabase).
5. Memberships and waitlist auto-promotion.

---

## Contributing

Found a bug or have a suggestion? Open an issue or reach out at **shubham46.56@gmail.com**

---

*Built with care in India 🇮🇳*
