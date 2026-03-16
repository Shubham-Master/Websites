import type { Pool, PoolClient } from "pg";
import { createConfirmationCode, createId } from "../lib/id.js";
import { HttpError } from "../lib/http-error.js";
import { seededSessions } from "../domain/session-seed.js";
import type {
  BookingIntentInput,
  BookingIntentResult,
  ContactType,
  Lead,
  LeadInput,
  PaymentOrder,
  PaymentOrderInput,
  PaymentWebhookInput,
  Session,
  SessionStatus,
  SessionWithAvailability
} from "../domain/types.js";
import type { Store } from "./store.js";

interface IdRow {
  id: string;
}

interface SessionAvailabilityRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  starts_at: string | Date;
  ends_at: string | Date;
  timezone: string;
  capacity: number;
  price_inr: number;
  is_free: boolean;
  status: SessionStatus;
  captions_enabled_by_default: boolean;
  zero_recording_policy: boolean;
  remaining_seats: number;
  waitlist_open: boolean;
}

interface SessionLockRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  status: SessionStatus;
  starts_at: string | Date;
  ends_at: string | Date;
  timezone: string;
  capacity: number;
  price_inr: number;
  is_free: boolean;
  captions_enabled_by_default: boolean;
  zero_recording_policy: boolean;
}

interface ExistingBookingRow {
  id: string;
}

interface BookingRow {
  id: string;
  user_id: string;
  price_inr: number;
  status: string;
}

interface SessionRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  starts_at: string | Date;
  ends_at: string | Date;
  timezone: string;
  capacity: number;
  price_inr: number;
  is_free: boolean;
  status: SessionStatus;
  captions_enabled_by_default: boolean;
  zero_recording_policy: boolean;
}

interface BookingInsertRow {
  id: string;
  confirmation_code: string;
}

interface PaymentRow {
  id: string;
  booking_id: string | null;
  user_id: string;
  provider_order_id: string;
  provider_payment_id: string | null;
  amount_inr: number;
  status: PaymentOrder["status"];
  created_at: string | Date;
  updated_at: string | Date;
}

function normalizeContact(contact: string): string {
  return contact.trim().toLowerCase();
}

function inferContactType(contact: string, provided: ContactType): ContactType {
  if (provided === "phone" || provided === "whatsapp") {
    return provided;
  }

  return contact.includes("@") ? "email" : "whatsapp";
}

function toIsoString(value: string | Date): string {
  return new Date(value).toISOString();
}

function mapSession(row: SessionAvailabilityRow): SessionWithAvailability {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    language: row.language,
    startsAt: toIsoString(row.starts_at),
    endsAt: toIsoString(row.ends_at),
    timezone: row.timezone,
    capacity: row.capacity,
    priceInr: row.price_inr,
    isFree: row.is_free,
    status: row.status,
    captionsEnabledByDefault: row.captions_enabled_by_default,
    zeroRecordingPolicy: row.zero_recording_policy,
    remainingSeats: Number(row.remaining_seats),
    waitlistOpen: row.waitlist_open
  };
}

function mapPayment(row: PaymentRow): PaymentOrder {
  if (!row.booking_id) {
    throw new Error("Payment row is missing booking_id.");
  }

  return {
    id: row.id,
    bookingId: row.booking_id,
    userId: row.user_id,
    providerOrderId: row.provider_order_id,
    providerPaymentId: row.provider_payment_id,
    amountInr: row.amount_inr,
    status: row.status,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };
}

function mapSessionRow(row: SessionRow): Session {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    language: row.language,
    startsAt: toIsoString(row.starts_at),
    endsAt: toIsoString(row.ends_at),
    timezone: row.timezone,
    capacity: row.capacity,
    priceInr: row.price_inr,
    isFree: row.is_free,
    status: row.status,
    captionsEnabledByDefault: row.captions_enabled_by_default,
    zeroRecordingPolicy: row.zero_recording_policy
  };
}

export class PostgresStore implements Store {
  constructor(
    private readonly pool: Pool,
    private readonly bookingHoldMinutes: number
  ) {}

  async initialize(): Promise<void> {
    const tableCheck = await this.pool.query<{ table_name: string | null }>(
      "SELECT to_regclass('public.sessions') AS table_name"
    );

    if (!tableCheck.rows[0]?.table_name) {
      throw new Error("Supabase schema not found. Run `npm run db:init` before starting the backend with DATABASE_URL.");
    }

    await this.seedSessionsIfEmpty();
  }

  async listSessions(): Promise<SessionWithAvailability[]> {
    const result = await this.pool.query<SessionAvailabilityRow>(
      `
        SELECT
          s.id,
          s.slug,
          s.title,
          s.description,
          s.language,
          s.starts_at,
          s.ends_at,
          s.timezone,
          s.capacity,
          s.price_inr,
          s.is_free,
          s.status,
          s.captions_enabled_by_default,
          s.zero_recording_policy,
          GREATEST(0, s.capacity - COALESCE(reserved.reserved_count, 0))::int AS remaining_seats,
          TRUE AS waitlist_open
        FROM sessions s
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::int AS reserved_count
          FROM bookings b
          LEFT JOIN booking_intents bi ON bi.id = b.booking_intent_id
          WHERE b.session_id = s.id
            AND (
              b.status IN ('confirmed', 'attended')
              OR (
                b.status = 'pending_payment'
                AND bi.status = 'active'
                AND bi.expires_at > NOW()
              )
            )
        ) reserved ON TRUE
        WHERE s.status = 'published'
          AND s.starts_at > NOW()
        ORDER BY s.starts_at ASC
      `
    );

    return result.rows.map(mapSession);
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    const result = await this.pool.query<SessionRow>(
      `
        SELECT
          id,
          slug,
          title,
          description,
          language,
          starts_at,
          ends_at,
          timezone,
          capacity,
          price_inr,
          is_free,
          status,
          captions_enabled_by_default,
          zero_recording_policy
        FROM sessions
        WHERE id = $1
        LIMIT 1
      `,
      [sessionId]
    );

    return result.rows[0] ? mapSessionRow(result.rows[0]) : null;
  }

  async createLead(input: LeadInput): Promise<Lead> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const userId = await this.upsertUser(
        client,
        input.displayName,
        input.contact,
        input.contactType,
        input.marketingConsent ?? false,
        input.note
      );

      const leadResult = await client.query<{
        id: string;
        created_at: string | Date;
      }>(
        `
          INSERT INTO leads (
            user_id,
            source,
            selected_session_id,
            topic_choice,
            custom_topic,
            note
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, created_at
        `,
        [
          userId,
          input.source,
          input.selectedSessionId ?? null,
          input.topicChoice ?? null,
          input.customTopic ?? null,
          input.note ?? null
        ]
      );

      await client.query("COMMIT");

      const lead = leadResult.rows[0];
      return {
        id: lead.id,
        userId,
        source: input.source,
        selectedSessionId: input.selectedSessionId ?? null,
        topicChoice: input.topicChoice ?? null,
        customTopic: input.customTopic ?? null,
        note: input.note ?? null,
        createdAt: toIsoString(lead.created_at)
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async createBookingIntent(input: BookingIntentInput): Promise<BookingIntentResult> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const sessionResult = await client.query<SessionLockRow>(
        `
          SELECT
            id,
            slug,
            title,
            description,
            language,
            status,
            starts_at,
            ends_at,
            timezone,
            capacity,
            price_inr,
            is_free,
            captions_enabled_by_default,
            zero_recording_policy
          FROM sessions
          WHERE id = $1
          LIMIT 1
          FOR UPDATE
        `,
        [input.sessionId]
      );

      const session = sessionResult.rows[0];
      if (!session || session.status !== "published") {
        throw new HttpError(404, "Session not found.");
      }

      if (new Date(session.starts_at).getTime() <= Date.now()) {
        throw new HttpError(400, "This session is no longer available for booking.");
      }

      const userId = await this.upsertUser(client, input.displayName, input.contact, input.contactType, false, input.note);

      const existingBooking = await client.query<ExistingBookingRow>(
        `
          SELECT id
          FROM bookings
          WHERE user_id = $1
            AND session_id = $2
            AND status <> 'cancelled'
          LIMIT 1
        `,
        [userId, session.id]
      );

      if (existingBooking.rowCount) {
        throw new HttpError(409, "You already have a booking for this session.");
      }

      const remainingSeats = Math.max(0, session.capacity - (await this.countReservedSeats(client, session.id)));
      const now = new Date();

      if (remainingSeats === 0) {
        const waitlistBooking = await client.query<BookingInsertRow>(
          `
            INSERT INTO bookings (
              user_id,
              session_id,
              booking_intent_id,
              status,
              price_inr,
              confirmation_code,
              topic_choice,
              custom_topic,
              note
            )
            VALUES ($1, $2, NULL, 'waitlisted', $3, $4, $5, $6, $7)
            RETURNING id, confirmation_code
          `,
          [
            userId,
            session.id,
            session.price_inr,
            createConfirmationCode(),
            input.topicChoice ?? null,
            input.customTopic ?? null,
            input.note ?? null
          ]
        );

        await client.query("COMMIT");

        return {
          bookingId: waitlistBooking.rows[0].id,
          bookingIntentId: null,
          bookingStatus: "waitlisted",
          paymentRequired: false,
          expiresAt: null,
          amountInr: session.price_inr,
          confirmationCode: waitlistBooking.rows[0].confirmation_code,
          message: "Session is currently full. You have been added to the waitlist."
        };
      }

      if (session.is_free) {
        const booking = await client.query<BookingInsertRow>(
          `
            INSERT INTO bookings (
              user_id,
              session_id,
              booking_intent_id,
              status,
              price_inr,
              confirmation_code,
              topic_choice,
              custom_topic,
              note
            )
            VALUES ($1, $2, NULL, 'confirmed', 0, $3, $4, $5, $6)
            RETURNING id, confirmation_code
          `,
          [
            userId,
            session.id,
            createConfirmationCode(),
            input.topicChoice ?? null,
            input.customTopic ?? null,
            input.note ?? null
          ]
        );

        await client.query("COMMIT");

        return {
          bookingId: booking.rows[0].id,
          bookingIntentId: null,
          bookingStatus: "confirmed",
          paymentRequired: false,
          expiresAt: null,
          amountInr: 0,
          confirmationCode: booking.rows[0].confirmation_code,
          message: "Your free session has been confirmed."
        };
      }

      const expiresAt = new Date(now.getTime() + this.bookingHoldMinutes * 60 * 1000);
      const intentResult = await client.query<IdRow>(
        `
          INSERT INTO booking_intents (
            user_id,
            session_id,
            pricing_mode,
            status,
            expires_at
          )
          VALUES ($1, $2, $3, 'active', $4)
          RETURNING id
        `,
        [userId, session.id, input.pricingMode ?? "drop_in", expiresAt]
      );

      const bookingResult = await client.query<BookingInsertRow>(
        `
          INSERT INTO bookings (
            user_id,
            session_id,
            booking_intent_id,
            status,
            price_inr,
            confirmation_code,
            topic_choice,
            custom_topic,
            note
          )
          VALUES ($1, $2, $3, 'pending_payment', $4, $5, $6, $7, $8)
          RETURNING id, confirmation_code
        `,
        [
          userId,
          session.id,
          intentResult.rows[0].id,
          session.price_inr,
          createConfirmationCode(),
          input.topicChoice ?? null,
          input.customTopic ?? null,
          input.note ?? null
        ]
      );

      await client.query("COMMIT");

      return {
        bookingId: bookingResult.rows[0].id,
        bookingIntentId: intentResult.rows[0].id,
        bookingStatus: "pending_payment",
        paymentRequired: true,
        expiresAt: expiresAt.toISOString(),
        amountInr: session.price_inr,
        confirmationCode: bookingResult.rows[0].confirmation_code,
        message: "Complete payment to confirm your seat."
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async createPaymentOrder(input: PaymentOrderInput): Promise<PaymentOrder> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const bookingResult = await client.query<BookingRow>(
        `
          SELECT id, user_id, price_inr, status
          FROM bookings
          WHERE id = $1
          LIMIT 1
          FOR UPDATE
        `,
        [input.bookingId]
      );

      const booking = bookingResult.rows[0];
      if (!booking) {
        throw new HttpError(404, "Booking not found.");
      }

      if (booking.status !== "pending_payment") {
        throw new HttpError(400, "Payment can only be created for pending bookings.");
      }

      const existingOrder = await client.query<PaymentRow>(
        `
          SELECT
            id,
            booking_id,
            user_id,
            provider_order_id,
            provider_payment_id,
            amount_inr,
            status,
            created_at,
            updated_at
          FROM payments
          WHERE booking_id = $1
            AND status = 'created'
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [booking.id]
      );

      if (existingOrder.rowCount) {
        await client.query("COMMIT");
        return mapPayment(existingOrder.rows[0]);
      }

      const paymentResult = await client.query<PaymentRow>(
        `
          INSERT INTO payments (
            booking_id,
            user_id,
            kind,
            provider,
            provider_order_id,
            amount_inr,
            status,
            idempotency_key,
            metadata
          )
          VALUES ($1, $2, 'session', 'razorpay', $3, $4, 'created', $5, '{}'::jsonb)
          RETURNING
            id,
            booking_id,
            user_id,
            provider_order_id,
            provider_payment_id,
            amount_inr,
            status,
            created_at,
            updated_at
        `,
        [
          booking.id,
          booking.user_id,
          createId("razorpay_order"),
          booking.price_inr,
          createId("payment_key")
        ]
      );

      await client.query("COMMIT");
      return mapPayment(paymentResult.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async confirmPayment(input: PaymentWebhookInput): Promise<PaymentOrder> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const paymentResult = await client.query<PaymentRow>(
        `
          SELECT
            id,
            booking_id,
            user_id,
            provider_order_id,
            provider_payment_id,
            amount_inr,
            status,
            created_at,
            updated_at
          FROM payments
          WHERE provider_order_id = $1
          LIMIT 1
          FOR UPDATE
        `,
        [input.providerOrderId]
      );

      const payment = paymentResult.rows[0];
      if (!payment) {
        throw new HttpError(404, "Payment order not found.");
      }

      const bookingResult = await client.query<IdRow>(
        `
          SELECT id
          FROM bookings
          WHERE id = $1
          LIMIT 1
          FOR UPDATE
        `,
        [payment.booking_id]
      );

      if (!bookingResult.rowCount) {
        throw new HttpError(404, "Booking not found for payment order.");
      }

      const updatedPaymentResult = await client.query<PaymentRow>(
        `
          UPDATE payments
          SET
            provider_payment_id = $1,
            status = 'captured',
            updated_at = NOW()
          WHERE id = $2
          RETURNING
            id,
            booking_id,
            user_id,
            provider_order_id,
            provider_payment_id,
            amount_inr,
            status,
            created_at,
            updated_at
        `,
        [input.providerPaymentId, payment.id]
      );

      await client.query(
        `
          UPDATE bookings
          SET
            status = 'confirmed',
            updated_at = NOW()
          WHERE id = $1
        `,
        [payment.booking_id]
      );

      await client.query("COMMIT");
      return mapPayment(updatedPaymentResult.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private async upsertUser(
    client: PoolClient,
    displayName: string,
    rawContact: string,
    contactType: ContactType,
    marketingConsent = false,
    accessibilityNotes?: string | null
  ): Promise<string> {
    const contact = normalizeContact(rawContact);
    const resolvedType = inferContactType(contact, contactType);
    const lookupColumn = resolvedType === "email" ? "email" : "phone_e164";

    const existingUserResult = await client.query<IdRow>(
      `
        SELECT id
        FROM users
        WHERE ${lookupColumn} = $1
        LIMIT 1
      `,
      [contact]
    );

    if (existingUserResult.rowCount) {
      const existingUserId = existingUserResult.rows[0].id;
      await client.query(
        `
          UPDATE users
          SET
            display_name = $1,
            preferred_contact_type = $2,
            marketing_consent = $3,
            accessibility_notes = COALESCE($4, accessibility_notes),
            updated_at = NOW()
          WHERE id = $5
        `,
        [displayName, resolvedType, marketingConsent, accessibilityNotes ?? null, existingUserId]
      );

      return existingUserId;
    }

    const insertedUser = await client.query<IdRow>(
      `
        INSERT INTO users (
          display_name,
          email,
          phone_e164,
          preferred_contact_type,
          marketing_consent,
          accessibility_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [
        displayName,
        resolvedType === "email" ? contact : null,
        resolvedType === "email" ? null : contact,
        resolvedType,
        marketingConsent,
        accessibilityNotes ?? null
      ]
    );

    return insertedUser.rows[0].id;
  }

  private async countReservedSeats(client: PoolClient, sessionId: string): Promise<number> {
    const result = await client.query<{ reserved_count: number }>(
      `
        SELECT COUNT(*)::int AS reserved_count
        FROM bookings b
        LEFT JOIN booking_intents bi ON bi.id = b.booking_intent_id
        WHERE b.session_id = $1
          AND (
            b.status IN ('confirmed', 'attended')
            OR (
              b.status = 'pending_payment'
              AND bi.status = 'active'
              AND bi.expires_at > NOW()
            )
          )
      `,
      [sessionId]
    );

    return Number(result.rows[0]?.reserved_count ?? 0);
  }

  private async seedSessionsIfEmpty(): Promise<void> {
    const result = await this.pool.query<{ count: string }>("SELECT COUNT(*) AS count FROM sessions");
    if (Number(result.rows[0]?.count ?? 0) > 0) {
      return;
    }

    for (const session of seededSessions) {
      await this.pool.query(
        `
          INSERT INTO sessions (
            slug,
            title,
            description,
            language,
            starts_at,
            ends_at,
            timezone,
            capacity,
            price_inr,
            is_free,
            status,
            captions_enabled_by_default,
            zero_recording_policy
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (slug) DO NOTHING
        `,
        [
          session.slug,
          session.title,
          session.description,
          session.language,
          session.startsAt,
          session.endsAt,
          session.timezone,
          session.capacity,
          session.priceInr,
          session.isFree,
          session.status,
          session.captionsEnabledByDefault,
          session.zeroRecordingPolicy
        ]
      );
    }
  }
}
