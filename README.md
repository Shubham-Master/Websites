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

---

## Contributing

Found a bug or have a suggestion? Open an issue or reach out at **shubham46.56@gmail.com**

---

*Built with care in India 🇮🇳*
