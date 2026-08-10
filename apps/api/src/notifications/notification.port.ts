/**
 * NotificationPort - the Pakistani SMS provider WILL change (Harness §2), and WhatsApp is
 * disabled behind a flag until the business number is approved. All sending goes through
 * this interface so swapping Twilio for another provider touches one file, not the domain.
 */
export interface SendResult {
  provider: string;
  providerId?: string;
  ok: boolean;
  error?: string;
}

export interface NotificationPort {
  sendSms(to: string, body: string): Promise<SendResult>;
  sendWhatsApp(to: string, body: string): Promise<SendResult>;
}

export const NOTIFICATION_PORT = Symbol('NOTIFICATION_PORT');
