# 🎙️ Unmute — Storytelling Circles for Those Who Hear Differently

> India's first accessible storytelling community — built for people navigating hearing loss and rebuilding confidence through shared stories.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Vercel](https://img.shields.io/badge/hosted-Vercel-black)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ What is Unmute?

Unmute is a private, AI-captioned storytelling platform where people with hearing loss connect with strangers who truly understand. Every session is small (5–7 people), facilitator-led, and built around one rule: **your story is the centrepiece.**

- 🔴 **Live AI captions** on every session
- 🎭 **Avatar mode** — camera optional
- 🔒 **Zero-recording policy** — what's said here, stays here
- 🇮🇳 **India-first** — UPI/Razorpay payments, Hindi/Hinglish sessions

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js + Express (Vercel Serverless Functions) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Razorpay (UPI, Cards, Wallets) |
| Email | Resend.com |
| Hosting | Vercel |

---

## 📁 Project Structure

```
unmute/
├── public/                     # Frontend
│   ├── index.html              # Landing page
│   ├── css/
│   │   ├── main.css            # Global styles
│   │   ├── components.css      # Reusable UI components
│   │   └── animations.css      # Transitions & keyframes
│   ├── js/
│   │   ├── main.js             # Core interactions
│   │   ├── auth.js             # Login / signup flow
│   │   ├── booking.js          # Session booking logic
│   │   └── payment.js          # Razorpay integration
│   └── pages/
│       ├── dashboard.html      # Member dashboard
│       ├── login.html          # Auth page
│       └── sessions.html       # Browse all sessions
│
├── api/                        # Vercel Serverless Functions
│   ├── auth/
│   │   ├── signup.js
│   │   └── login.js
│   ├── sessions/
│   │   ├── list.js
│   │   ├── book.js
│   │   └── cancel.js
│   ├── payments/
│   │   ├── create-order.js
│   │   └── verify.js
│   └── email/
│       └── send.js
│
├── lib/                        # Shared utilities
│   ├── supabase.js
│   ├── razorpay.js
│   └── resend.js
│
├── vercel.json                 # Routing & function config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) account (free)
- A [Razorpay](https://razorpay.com) account (test mode)
- A [Resend](https://resend.com) account (free)

### 1. Clone the repo
```bash
git clone https://github.com/Shubham-Master/Websites.git
cd unmute
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:
```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Resend
RESEND_API_KEY=your_resend_api_key

# App
APP_URL=https://your-vercel-url.vercel.app
```

### 4. Run locally
```bash
npm run dev
# or with Vercel CLI
vercel dev
```

---

## 🗄️ Database Schema

```sql
-- Users
users (id, name, email, pseudonym, plan, created_at)

-- Sessions
sessions (id, title, date, slots_total, slots_remaining, price, theme)

-- Bookings
bookings (id, user_id, session_id, status, payment_id, created_at)

-- Payments
payments (id, user_id, amount, razorpay_order_id, status)

-- Memberships
memberships (id, user_id, plan, valid_until)
```

---

## 🔄 User Flow

```
Landing Page
    ↓
"Join a Circle" → Login / Signup (Supabase Auth)
    ↓
Browse Sessions → Select & Book
    ↓
Razorpay Payment (UPI / Card / Wallet)
    ↓
Booking Confirmed → Email via Resend
    ↓
Member Dashboard (view bookings, upcoming sessions)
```

---

## 📦 Build Phases

- [x] **Phase 1** — Project setup, split CSS/JS, Vercel config
- [ ] **Phase 2** — Supabase DB + Auth (signup, login, dashboard)
- [ ] **Phase 3** — Sessions API (list, book, cancel)
- [ ] **Phase 4** — Razorpay payments (create order, verify webhook)
- [ ] **Phase 5** — Email notifications (booking confirm, reminders)

---

## 🌐 Deployment

This project is deployed on **Vercel**. Every push to `main` auto-deploys.

```bash
# Deploy manually
vercel --prod
```

Add your environment variables in:
`Vercel Dashboard → Project → Settings → Environment Variables`

---

## 📄 License

MIT © 2026 Unmute. Built with care in India 🇮🇳
