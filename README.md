# Websites



unmute/
├── public/                  # Frontend
│   ├── index.html
│   ├── css/
│   │   ├── main.css
│   │   ├── components.css
│   │   └── animations.css
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── booking.js
│   │   └── payment.js
│   └── pages/
│       ├── dashboard.html   # Member dashboard
│       ├── login.html
│       └── sessions.html
│
├── api/                     # Vercel Serverless Functions
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
├── lib/                     # Shared utilities
│   ├── supabase.js
│   ├── razorpay.js
│   └── resend.js
│
├── vercel.json              # Routing config
└── package.json
