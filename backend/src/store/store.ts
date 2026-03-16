import type {
  BookingIntentInput,
  BookingIntentResult,
  Lead,
  LeadInput,
  PaymentOrder,
  PaymentOrderInput,
  PaymentWebhookInput,
  SessionWithAvailability
} from "../domain/types.js";

export interface Store {
  listSessions(): Promise<SessionWithAvailability[]>;
  createLead(input: LeadInput): Promise<Lead>;
  createBookingIntent(input: BookingIntentInput): Promise<BookingIntentResult>;
  createPaymentOrder(input: PaymentOrderInput): Promise<PaymentOrder>;
  confirmPayment(input: PaymentWebhookInput): Promise<PaymentOrder>;
  close?(): Promise<void>;
}
