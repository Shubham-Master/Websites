export type ContactType = "email" | "whatsapp" | "phone";
export type SessionStatus = "draft" | "published" | "sold_out" | "completed" | "cancelled";
export type BookingStatus =
  | "draft"
  | "pending_payment"
  | "confirmed"
  | "waitlisted"
  | "cancelled"
  | "attended"
  | "no_show"
  | "refunded";
export type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded";

export interface User {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  contactType: ContactType;
  marketingConsent: boolean;
  accessibilityNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  capacity: number;
  priceInr: number;
  isFree: boolean;
  status: SessionStatus;
  captionsEnabledByDefault: boolean;
  zeroRecordingPolicy: boolean;
}

export interface Lead {
  id: string;
  userId: string;
  source: string;
  selectedSessionId: string | null;
  topicChoice: string | null;
  customTopic: string | null;
  note: string | null;
  createdAt: string;
}

export interface BookingIntent {
  id: string;
  userId: string;
  sessionId: string;
  pricingMode: "drop_in" | "membership";
  status: "active" | "expired" | "converted";
  expiresAt: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  sessionId: string;
  bookingIntentId: string | null;
  status: BookingStatus;
  priceInr: number;
  confirmationCode: string;
  topicChoice: string | null;
  customTopic: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentOrder {
  id: string;
  bookingId: string;
  userId: string;
  providerOrderId: string;
  providerPaymentId: string | null;
  amountInr: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SessionWithAvailability extends Session {
  remainingSeats: number;
  waitlistOpen: boolean;
}

export interface LeadInput {
  displayName: string;
  contact: string;
  contactType: ContactType;
  selectedSessionId?: string | null;
  topicChoice?: string | null;
  customTopic?: string | null;
  note?: string | null;
  source: string;
  marketingConsent?: boolean;
}

export interface BookingIntentInput {
  sessionId: string;
  displayName: string;
  contact: string;
  contactType: ContactType;
  pricingMode?: "drop_in" | "membership";
  topicChoice?: string | null;
  customTopic?: string | null;
  note?: string | null;
}

export interface BookingIntentResult {
  bookingId: string;
  bookingIntentId: string | null;
  bookingStatus: BookingStatus;
  paymentRequired: boolean;
  expiresAt: string | null;
  amountInr: number;
  message: string;
}

export interface PaymentOrderInput {
  bookingId: string;
}

export interface PaymentWebhookInput {
  providerOrderId: string;
  providerPaymentId: string;
}
