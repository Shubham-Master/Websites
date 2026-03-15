CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('guest', 'member', 'facilitator', 'admin');
CREATE TYPE contact_type AS ENUM ('email', 'whatsapp', 'phone');
CREATE TYPE session_status AS ENUM ('draft', 'published', 'sold_out', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM (
  'draft',
  'pending_payment',
  'confirmed',
  'waitlisted',
  'cancelled',
  'attended',
  'no_show',
  'refunded'
);
CREATE TYPE payment_status AS ENUM ('created', 'authorized', 'captured', 'failed', 'refunded');
CREATE TYPE payment_kind AS ENUM ('session', 'membership');
CREATE TYPE membership_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'expired');
CREATE TYPE provider_kind AS ENUM ('razorpay', 'email', 'whatsapp', 'video');
CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'failed');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL DEFAULT 'guest',
  display_name VARCHAR(120) NOT NULL,
  email VARCHAR(255),
  phone_e164 VARCHAR(20),
  preferred_contact_type contact_type,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  locale VARCHAR(16) NOT NULL DEFAULT 'en-IN',
  accessibility_notes TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_contact_present CHECK (email IS NOT NULL OR phone_e164 IS NOT NULL)
);

CREATE UNIQUE INDEX users_email_unique ON users (LOWER(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX users_phone_unique ON users (phone_e164) WHERE phone_e164 IS NOT NULL;

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  source VARCHAR(80) NOT NULL,
  selected_session_id UUID,
  note TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(140) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  language VARCHAR(40) NOT NULL DEFAULT 'Hinglish',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  reserved_seats INTEGER NOT NULL DEFAULT 0 CHECK (reserved_seats >= 0),
  waitlist_capacity INTEGER NOT NULL DEFAULT 25 CHECK (waitlist_capacity >= 0),
  price_inr INTEGER NOT NULL DEFAULT 0 CHECK (price_inr >= 0),
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  status session_status NOT NULL DEFAULT 'draft',
  facilitator_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  room_provider provider_kind,
  room_external_id VARCHAR(180),
  captions_enabled_by_default BOOLEAN NOT NULL DEFAULT TRUE,
  zero_recording_policy BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT session_end_after_start CHECK (ends_at > starts_at),
  CONSTRAINT session_free_price_check CHECK (
    (is_free = TRUE AND price_inr = 0) OR
    (is_free = FALSE AND price_inr >= 0)
  )
);

CREATE INDEX sessions_starts_at_idx ON sessions (starts_at);
CREATE INDEX sessions_status_idx ON sessions (status);

ALTER TABLE leads
ADD CONSTRAINT leads_selected_session_fk
FOREIGN KEY (selected_session_id) REFERENCES sessions(id) ON DELETE SET NULL;

CREATE TABLE booking_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  pricing_mode VARCHAR(40) NOT NULL DEFAULT 'drop_in',
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX booking_intents_session_idx ON booking_intents (session_id, expires_at);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  booking_intent_id UUID REFERENCES booking_intents(id) ON DELETE SET NULL,
  status booking_status NOT NULL DEFAULT 'draft',
  price_inr INTEGER NOT NULL DEFAULT 0 CHECK (price_inr >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  confirmation_code VARCHAR(32) NOT NULL UNIQUE,
  joined_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, session_id)
);

CREATE INDEX bookings_session_status_idx ON bookings (session_id, status);
CREATE INDEX bookings_user_idx ON bookings (user_id, created_at DESC);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind payment_kind NOT NULL,
  provider provider_kind NOT NULL DEFAULT 'razorpay',
  provider_order_id VARCHAR(180),
  provider_payment_id VARCHAR(180),
  provider_refund_id VARCHAR(180),
  amount_inr INTEGER NOT NULL CHECK (amount_inr >= 0),
  status payment_status NOT NULL DEFAULT 'created',
  idempotency_key VARCHAR(120) NOT NULL UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX payments_booking_idx ON payments (booking_id);
CREATE INDEX payments_user_idx ON payments (user_id, created_at DESC);

CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  price_inr INTEGER NOT NULL CHECK (price_inr >= 0),
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly',
  session_reservation_limit INTEGER NOT NULL DEFAULT 4,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
  status membership_status NOT NULL DEFAULT 'trial',
  provider provider_kind NOT NULL DEFAULT 'razorpay',
  provider_subscription_id VARCHAR(180),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX memberships_user_status_idx ON memberships (user_id, status);

CREATE TABLE session_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  room_provider provider_kind NOT NULL DEFAULT 'video',
  room_url TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  caption_preference BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX session_access_booking_idx ON session_access_tokens (booking_id, expires_at DESC);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  channel provider_kind NOT NULL,
  template_key VARCHAR(80) NOT NULL,
  status notification_status NOT NULL DEFAULT 'queued',
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_schedule_idx ON notifications (status, scheduled_for);

CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(80) NOT NULL,
  diff JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
