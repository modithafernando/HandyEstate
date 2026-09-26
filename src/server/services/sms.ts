import "server-only";
import { env } from "../env";

export interface SmsProvider {
  send(to: string, body: string): Promise<void>;
}

/** Development: prints messages to the server log. */
class ConsoleSmsProvider implements SmsProvider {
  async send(to: string, body: string) {
    console.info(`[sms] → ${to}: ${body}`);
  }
}

/**
 * Add a real gateway (e.g. Notify.lk, Dialog, Mobitel, Twilio) by implementing
 * SmsProvider and returning it here for its SMS_PROVIDER value.
 */
export function getSmsProvider(): SmsProvider {
  switch (env.smsProvider) {
    case "console":
      return new ConsoleSmsProvider();
    default:
      throw new Error(`SMS provider "${env.smsProvider}" is not configured`);
  }
}
