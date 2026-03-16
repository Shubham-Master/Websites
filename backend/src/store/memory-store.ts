import { createConfirmationCode, createId } from "../lib/id.js";
import { HttpError } from "../lib/http-error.js";
import { seededSessions } from "../domain/session-seed.js";
import type {
  Booking,
  BookingIntent,
  BookingIntentInput,
  BookingIntentResult,
  ContactType,
  Lead,
  LeadInput,
  PaymentOrder,
  PaymentOrderInput,
  PaymentWebhookInput,
  Session,
  SessionWithAvailability,
  User
} from "../domain/types.js";
import type { Store } from "./store.js";

function isEmail(contact: string): boolean {
  return contact.includes("@");
}

function normalizeContact(contact: string): string {
  return contact.trim().toLowerCase();
}

function inferContactType(contact: string, provided: ContactType): ContactType {
  if (provided === "phone" || provided === "whatsapp") {
    return provided;
  }

  return isEmail(contact) ? "email" : "whatsapp";
}

export class MemoryStore implements Store {
  private users = new Map<string, User>();
  private sessions = new Map<string, Session>(seededSessions.map((session) => [session.id, session]));
  private leads = new Map<string, Lead>();
  private bookingIntents = new Map<string, BookingIntent>();
  private bookings = new Map<string, Booking>();
  private payments = new Map<string, PaymentOrder>();

  constructor(private readonly bookingHoldMinutes = 10) {}

  async listSessions(): Promise<SessionWithAvailability[]> {
    const now = Date.now();
    const sessions = Array.from(this.sessions.values())
      .filter((session) => session.status === "published" && new Date(session.startsAt).getTime() > now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    return sessions.map((session) => ({
      ...session,
      remainingSeats: Math.max(0, session.capacity - this.countReservedSeats(session.id)),
      waitlistOpen: true
    }));
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async createLead(input: LeadInput): Promise<Lead> {
    const user = this.upsertUser(input.displayName, input.contact, input.contactType, input.marketingConsent, input.note);
    const lead: Lead = {
      id: createId("lead"),
      userId: user.id,
      source: input.source,
      selectedSessionId: input.selectedSessionId ?? null,
      topicChoice: input.topicChoice ?? null,
      customTopic: input.customTopic ?? null,
      note: input.note ?? null,
      createdAt: new Date().toISOString()
    };

    this.leads.set(lead.id, lead);
    return lead;
  }

  async createBookingIntent(input: BookingIntentInput): Promise<BookingIntentResult> {
    const session = this.sessions.get(input.sessionId);
    if (!session || session.status !== "published") {
      throw new HttpError(404, "Session not found.");
    }

    const now = new Date();
    if (new Date(session.startsAt).getTime() <= now.getTime()) {
      throw new HttpError(400, "This session is no longer available for booking.");
    }

    const user = this.upsertUser(input.displayName, input.contact, input.contactType, false, input.note);
    const existingBooking = Array.from(this.bookings.values()).find(
      (booking) => booking.userId === user.id && booking.sessionId === session.id && booking.status !== "cancelled"
    );

    if (existingBooking) {
      throw new HttpError(409, "You already have a booking for this session.");
    }

    const remainingSeats = Math.max(0, session.capacity - this.countReservedSeats(session.id));

    if (remainingSeats === 0) {
      const waitlistBooking: Booking = {
        id: createId("book"),
        userId: user.id,
        sessionId: session.id,
        bookingIntentId: null,
        status: "waitlisted",
        priceInr: session.priceInr,
        confirmationCode: createConfirmationCode(),
        topicChoice: input.topicChoice ?? null,
        customTopic: input.customTopic ?? null,
        note: input.note ?? null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      this.bookings.set(waitlistBooking.id, waitlistBooking);

      return {
        bookingId: waitlistBooking.id,
        bookingIntentId: null,
        bookingStatus: "waitlisted",
        paymentRequired: false,
        expiresAt: null,
        amountInr: session.priceInr,
        confirmationCode: waitlistBooking.confirmationCode,
        message: "Session is currently full. You have been added to the waitlist."
      };
    }

    if (session.isFree) {
      const booking: Booking = {
        id: createId("book"),
        userId: user.id,
        sessionId: session.id,
        bookingIntentId: null,
        status: "confirmed",
        priceInr: 0,
        confirmationCode: createConfirmationCode(),
        topicChoice: input.topicChoice ?? null,
        customTopic: input.customTopic ?? null,
        note: input.note ?? null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      this.bookings.set(booking.id, booking);

      return {
        bookingId: booking.id,
        bookingIntentId: null,
        bookingStatus: "confirmed",
        paymentRequired: false,
        expiresAt: null,
        amountInr: 0,
        confirmationCode: booking.confirmationCode,
        message: "Your free session has been confirmed."
      };
    }

    const expiresAt = new Date(now.getTime() + this.bookingHoldMinutes * 60 * 1000).toISOString();
    const intent: BookingIntent = {
      id: createId("bi"),
      userId: user.id,
      sessionId: session.id,
      pricingMode: input.pricingMode ?? "drop_in",
      status: "active",
      expiresAt,
      createdAt: now.toISOString()
    };

    const booking: Booking = {
      id: createId("book"),
      userId: user.id,
      sessionId: session.id,
      bookingIntentId: intent.id,
      status: "pending_payment",
      priceInr: session.priceInr,
      confirmationCode: createConfirmationCode(),
      topicChoice: input.topicChoice ?? null,
      customTopic: input.customTopic ?? null,
      note: input.note ?? null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    this.bookingIntents.set(intent.id, intent);
    this.bookings.set(booking.id, booking);

    return {
      bookingId: booking.id,
      bookingIntentId: intent.id,
      bookingStatus: "pending_payment",
      paymentRequired: true,
      expiresAt,
      amountInr: session.priceInr,
      confirmationCode: booking.confirmationCode,
      message: "Complete payment to confirm your seat."
    };
  }

  async createPaymentOrder(input: PaymentOrderInput): Promise<PaymentOrder> {
    const booking = this.bookings.get(input.bookingId);
    if (!booking) {
      throw new HttpError(404, "Booking not found.");
    }

    if (booking.status !== "pending_payment") {
      throw new HttpError(400, "Payment can only be created for pending bookings.");
    }

    const existingOrder = Array.from(this.payments.values()).find(
      (payment) => payment.bookingId === booking.id && payment.status === "created"
    );
    if (existingOrder) {
      return existingOrder;
    }

    const payment: PaymentOrder = {
      id: createId("pay"),
      bookingId: booking.id,
      userId: booking.userId,
      providerOrderId: createId("razorpay_order"),
      providerPaymentId: null,
      amountInr: booking.priceInr,
      status: "created",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.payments.set(payment.id, payment);
    return payment;
  }

  async confirmPayment(input: PaymentWebhookInput): Promise<PaymentOrder> {
    const payment = Array.from(this.payments.values()).find((entry) => entry.providerOrderId === input.providerOrderId);
    if (!payment) {
      throw new HttpError(404, "Payment order not found.");
    }

    const booking = this.bookings.get(payment.bookingId);
    if (!booking) {
      throw new HttpError(404, "Booking not found for payment order.");
    }

    payment.providerPaymentId = input.providerPaymentId;
    payment.status = "captured";
    payment.updatedAt = new Date().toISOString();
    booking.status = "confirmed";
    booking.updatedAt = new Date().toISOString();

    this.payments.set(payment.id, payment);
    this.bookings.set(booking.id, booking);

    return payment;
  }

  private upsertUser(
    displayName: string,
    rawContact: string,
    contactType: ContactType,
    marketingConsent = false,
    accessibilityNotes?: string | null
  ): User {
    const contact = normalizeContact(rawContact);
    const resolvedType = inferContactType(contact, contactType);

    const user = Array.from(this.users.values()).find((entry) => {
      if (resolvedType === "email") {
        return entry.email === contact;
      }

      return entry.phone === contact;
    });

    if (user) {
      user.displayName = displayName;
      user.contactType = resolvedType;
      user.marketingConsent = marketingConsent;
      user.accessibilityNotes = accessibilityNotes ?? user.accessibilityNotes;
      user.updatedAt = new Date().toISOString();
      this.users.set(user.id, user);
      return user;
    }

    const createdAt = new Date().toISOString();
    const newUser: User = {
      id: createId("user"),
      displayName,
      email: resolvedType === "email" ? contact : null,
      phone: resolvedType === "email" ? null : contact,
      contactType: resolvedType,
      marketingConsent,
      accessibilityNotes: accessibilityNotes ?? null,
      createdAt,
      updatedAt: createdAt
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  private countReservedSeats(sessionId: string): number {
    const now = Date.now();

    return Array.from(this.bookings.values()).filter((booking) => {
      if (booking.sessionId !== sessionId) {
        return false;
      }

      if (booking.status === "confirmed" || booking.status === "attended") {
        return true;
      }

      if (booking.status !== "pending_payment" || !booking.bookingIntentId) {
        return false;
      }

      const intent = this.bookingIntents.get(booking.bookingIntentId);
      return Boolean(intent && intent.status === "active" && new Date(intent.expiresAt).getTime() > now);
    }).length;
  }
}
