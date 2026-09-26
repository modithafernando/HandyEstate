import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}

export const env = {
  get appSecret() {
    const v = required("APP_SECRET");
    if (process.env.NODE_ENV === "production" && v.length < 32) throw new Error("APP_SECRET must be at least 32 characters");
    return v;
  },
  smsProvider: process.env.SMS_PROVIDER ?? "console",
  storageDir: process.env.STORAGE_DIR ?? "./storage",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  isProd: process.env.NODE_ENV === "production",
  /** Show OTP codes on screen. Never in production. */
  get showDevCodes() {
    return process.env.NODE_ENV !== "production" && process.env.SMS_PROVIDER !== "live";
  },
};
