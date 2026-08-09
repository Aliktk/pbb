import { Injectable, Logger } from '@nestjs/common';
import type { NotificationPort, SendResult } from './notification.port';

/**
 * Default dev driver: logs instead of sending. NOTIFICATIONS_DRIVER=console.
 * The Twilio driver (T8) implements the same interface. WhatsApp stays disabled behind
 * WHATSAPP_ENABLED until the business number is approved.
 */
@Injectable()
export class ConsoleNotifier implements NotificationPort {
  private readonly log = new Logger('Notifier');

  async sendSms(to: string, body: string): Promise<SendResult> {
    this.log.log(`[SMS→${to}] ${body}`);
    return { provider: 'console', ok: true };
  }

  async sendWhatsApp(to: string, body: string): Promise<SendResult> {
    if (process.env.WHATSAPP_ENABLED !== 'true') {
      return { provider: 'console', ok: false, error: 'whatsapp_disabled' };
    }
    this.log.log(`[WA→${to}] ${body}`);
    return { provider: 'console', ok: true };
  }
}
