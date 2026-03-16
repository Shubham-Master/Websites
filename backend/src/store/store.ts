import type {
  BookingIntentInput,
  BookingIntentResult,
  Lead,
  LeadInput,
  PaymentOrder,
  PaymentOrderInput,
  PaymentWebhookInput,
  Session,
  SessionWithAvailability
} from "../domain/types.js";

export interface Store {
  listSessions(): Promise<SessionWithAvailability[]>;
  getSessionById(sessionId: string): Promise<Session | null>;
  createLead(input: LeadInput): Promise<Lead>;
  createBookingIntent(input: BookingIntentInput): Promise<BookingIntentResult>;
  createPaymentOrder(input: PaymentOrderInput): Promise<PaymentOrder>;
  confirmPayment(input: PaymentWebhookInput): Promise<PaymentOrder>;
  close?(): Promise<void>;
}
