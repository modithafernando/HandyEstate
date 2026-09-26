# HandyEstate

Find a trusted plumber, electrician, AC technician and more near you in Sri Lanka —
see who's free today, and call them. Beta: Matara & Galle.

> Need something fixed → find someone nearby → see if they're free today → call them.

The product and technical plan (requirements, journeys, schema, analytics, design system,
MVP boundaries) lives in [`docs/PLAN.md`](docs/PLAN.md).

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS 4 · PostgreSQL + Drizzle ORM ·
phone OTP auth (pluggable SMS) · local-disk storage behind a `Storage` interface (swap for S3/R2) ·
sharp for image processing · Phosphor icons · Schibsted Grotesk.

## Run it locally

```bash
cp .env.example .env            # set DATABASE_URL and APP_SECRET
npm install
npm run db:migrate              # create tables
npm run db:seed                 # categories, towns, tags + FICTIONAL demo providers
npm run dev                     # http://localhost:3000
```

`npm run db:seed -- --ref` seeds reference data only (use this in production).

### Signing in during development

SMS isn't sent in development — the 6-digit code is printed in the server log **and shown on
the sign-in screen**. Seeded accounts:

| Who | Phone |
|---|---|
| Admin | `070 000 0000` |
| Provider "Kasun Electrical" | `070 000 0100` |
| Other demo providers | `070 000 01NN` (in seed order) |
| Any new number | becomes a customer, or a provider via `/join` |

All demo data is fictional and flagged `is_demo`; demo profiles say so at the bottom.

## Tests

```bash
npm test                        # unit: search matching, phone/NIC parsing, availability expiry, ranking
npx playwright test             # e2e: search → profile → call, sign-up → approval → live, reviews, uploads
npm run lint && npm run typecheck
```

## Where things are

```
src/app/(site)          customer pages: home, search, profile, review, report, recent, join, login
src/app/pro             provider: setup steps, Today (availability switch + numbers), profile, photos, verify
src/app/admin           internal admin: metrics, approvals, verification, categories, reviews, reports
src/app/actions         Server Actions (all writes)
src/app/api, /go, /media  beacon events, contact (number hand-off), no-JS fallbacks, image serving
src/server/db           Drizzle schema + client
src/server/queries      reads (search & ranking, profiles, dashboard, admin metrics)
src/server/services     auth, OTP, SMS, storage, images, location, events, contact, reviews
src/lib/i18n            all UI strings (en complete; si/ta scaffolded, off until native copy exists)
src/components          small in-house UI kit — no component library
```

## Going to production — checklist

- Implement a real `SmsProvider` in `src/server/services/sms.ts` (e.g. Notify.lk / Dialog / Twilio) and set `SMS_PROVIDER`.
- Implement an S3/R2 `Storage` driver; keep NIC photos in a private bucket.
- Set a long random `APP_SECRET` (OTP + NIC hashing depend on it — don't rotate casually).
- Put the app behind a proxy that sets `X-Forwarded-For` (used for OTP rate limits).
- Seed reference data only (`--ref`), then create the first admin: `update users set is_admin = true where phone = '+94…'`.
