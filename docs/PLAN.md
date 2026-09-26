# HandyEstate — Product & Technical Plan (Beta)

> Need something fixed → find someone nearby → see if they're free today → call them.

Everything in this document is judged against that one line. If a feature
doesn't make that loop faster or more trustworthy, it's not in the beta.

---

## 1. Product requirements

**Customers (no account)**

- Pick a service (tap a category or type naturally: "tap leaking", "AC repair").
- Pick an area (nearest town from approximate location, or choose a town).
- See a short, ranked list of people who serve that area, who's taking work
  today first.
- Open a profile, judge trust in a few seconds (verified, reviews, photos,
  price guide), and call or WhatsApp.
- Leave a review (needs phone OTP — the only time a customer signs in).

**Providers**

- Sign up with phone + OTP, build a profile in short steps, go live after a
  quick admin check.
- One switch that matters: **Taking work today — On / Off**.
- See, in plain words, how many people saw them, opened their profile and
  called.
- Get a Verified badge by submitting their NIC (reviewed by a person).

**Internal**

- Approve/suspend providers, review NIC submissions, manage categories and
  search words, hide reviews, handle reports, see basic marketplace numbers.

**Non-goals (beta):** bookings, calendars, time slots, bids, payments, in-app
chat, provider subscriptions, ads, map view, native apps.

## 2. Customer journey

```
Home ── tap "Plumber" (or type "tap leaking") ──▶ Results (Matara)
                                                     │  available-today first
                                                     ├─ [Call] ─────────────▶ phone dialer   ← primary conversion
                                                     └─ tap row / View ─────▶ Profile
                                                                                 ├─ sticky [Call Nimal]
                                                                                 ├─ [WhatsApp]
                                                                                 └─ later: Write a review (OTP)
```

- First visit: town defaults to "Matara" (launch market) and a one-tap
  "Use my location" snaps to the nearest town. Choice is remembered in a
  cookie. GPS is never required.
- Zero-result handling: widen radius automatically and say so ("No one in
  Weligama yet — showing people within 25 km").
- "Recently viewed" (stored on the device only) lets someone call back the
  person they looked at yesterday — a real habit in this market.

## 3. Provider journey

```
/join ─▶ phone ─▶ OTP ─▶ Name + photo ─▶ What do you do? (categories)
      ─▶ Where are you? (town + radius) ─▶ Prices & work photos (optional, skippable)
      ─▶ "Profile sent for review" ─▶ Dashboard
                                        ├─ Taking work today [ON/OFF]   ← the whole point
                                        ├─ This week: seen / opened / calls / WhatsApp
                                        ├─ Finish your profile (checklist)
                                        └─ Get verified (NIC)
```

- Each onboarding step is one screen, one question, a big "Continue".
  Progress is saved per step, so a provider can stop and come back.
- NIC is **not** in the signup path. It's the "Get verified" step on the
  dashboard. This keeps signup to ~2 minutes and avoids scaring people off
  before they've seen value. (Challenge to the brief — see §19.)
- "Taking work today" turns itself off at midnight (Asia/Colombo). A
  forgotten "On" must never mislead a customer tomorrow.

## 4. Information architecture

```
Public
  /                       Who do you need?  (categories, search, area)
  /search?q=&cat=&area=   Results
  /p/[slug]               Provider profile
  /p/[slug]/review        Write a review (OTP gate)
  /recent                 Recently viewed (device-local)
  /login                  OTP sign-in (customers & providers)
  /join                   For providers: what it is, "Join free"
  /privacy, /terms        Short, plain-language

Provider  (/pro — signed-in provider only)
  /pro                    Today: availability switch + simple numbers
  /pro/setup/[step]       Progressive onboarding
  /pro/profile            Edit profile sections
  /pro/photos             Work photos
  /pro/verify             NIC verification
  /pro/reviews            Reviews received

Admin  (/admin — is_admin only)
  /admin                  Marketplace numbers
  /admin/providers        Queue + list, filter by status
  /admin/providers/[id]   Detail: approve / suspend / verify NIC
  /admin/categories       Categories + search words
  /admin/reviews          Moderation
  /admin/reports          Reported profiles
```

Mobile navigation: bottom bar with **Find · Recent · For pros** (customers)
and **Today · Profile · Reviews** (providers). At ≥ 1024 px the bottom bar
folds into the header.

## 5. Screen inventory

| Screen | Primary action | Notes |
|---|---|---|
| Home | Tap a category | H1 "Who do you need?", search, area chip, category grid, a few "available today" people |
| Area sheet | Choose town | "Use my location" + list grouped by district |
| Results | Call | Dividers, not cards. Available-today first. Widening notice when needed |
| Profile | Call (sticky) | WhatsApp secondary; services + "from Rs"; work photos; tag counts; reviews; report |
| Review | Submit | Stars → tags → optional comment. OTP if not signed in |
| Login | Get code / Verify | 2 screens, numeric keypad, paste-friendly |
| Join | Join free | What you get, what we ask, "free during beta" |
| Setup (×5) | Continue | One question per screen |
| Pro · Today | Toggle | Huge switch, then numbers in sentences |
| Pro · Profile | Save section | Same fields as setup |
| Pro · Verify | Submit NIC | Explains who sees it and when it's deleted |
| Admin (×6) | — | Plain tables, forms, confirm dialogs |

## 6. Database schema (PostgreSQL, Drizzle ORM)

```
users            id uuid pk, phone text unique (E.164), name, is_admin bool,
                 created_at, last_seen_at
otp_challenges   id, phone, code_hash, expires_at, attempts, consumed_at, ip, created_at
sessions         id (sha256 of token) pk, user_id → users, expires_at, created_at, user_agent

towns            id serial, slug unique, name, names jsonb {si,ta}, district,
                 lat, lng, is_active, sort
service_categories
                 id serial, slug unique, name, names jsonb, icon, search_terms text[],
                 sort, is_active

providers        id uuid, user_id → users unique, slug unique, display_name,
                 business_name, bio, phone, whatsapp (nullable → none),
                 photo_key, town_id → towns, service_radius_km,
                 status (draft|pending|approved|suspended), setup_step,
                 is_verified (denormalised from verifications),
                 available_until timestamptz,          ← "taking work today"
                 last_active_at, rating_sum, review_count,
                 is_demo, created_at, approved_at, suspended_reason
provider_categories  provider_id, category_id, pk(provider_id, category_id)
provider_services    id, provider_id, name, price_from (LKR int), price_unit, sort
provider_photos      id, provider_id, key, width, height, sort, created_at

verifications    id, provider_id, kind (nic), status (pending|approved|rejected),
                 nic_hmac, nic_last4, document_key (private, deleted after decision),
                 reviewer_id, reviewed_at, note, created_at

review_tags      id, slug, name, names jsonb, sort
reviews          id, provider_id, user_id, rating 1..5, comment (≤ 400),
                 status (published|hidden), had_contact bool, created_at,
                 unique(provider_id, user_id)
review_tag_links review_id, tag_id

reports          id, provider_id, visitor_id, user_id, reason, details,
                 status (open|resolved|dismissed), created_at, resolved_by, resolved_at

events           id bigserial, type, occurred_at, visitor_id, user_id,
                 provider_id, category_id, town_id, query, source, props jsonb
```

**Deliberate simplifications to the suggested entity list**

- `ProviderAvailability` → a single `available_until` column. The only state
  we need is "taking work today"; history lives in `AVAILABILITY_CHANGED`
  events.
- `ProviderLocation` → `town_id` + `service_radius_km`. Town centroids are
  precise enough for "2.4 km" and protect providers' home addresses. A
  per-provider pin can be added later without changing queries (coalesce).
- `CallEvent`, `ProfileView`, `SearchEvent` → one append-only `events`
  table with a `type`. One write path, one place to query, trivially
  exported to a warehouse later.
- `rating_sum`/`review_count` are denormalised on `providers` so results
  never aggregate reviews at query time.

## 7. API architecture

No separate API service. One Next.js app, three layers:

```
UI (Server Components, Client Components)
   │ reads                    │ writes
   ▼                          ▼
src/server/queries/*     Server Actions (src/app/**/actions.ts)
   │                          │
   └──────── src/server/services/* (auth, providers, reviews, search, events, storage)
                              │
                         Drizzle → PostgreSQL
```

- Reads: Server Components call query functions directly.
- Writes: Server Actions (built-in origin checks, progressive forms).
- Route handlers only where a URL is the interface:
  - `POST /api/events` — beacon for impressions/profile opens (batched)
  - `POST /api/contact` — returns the number, logs CALL/WHATSAPP/REVEAL
  - `GET /go/[kind]/[id]` — no-JS fallback: logs, then redirects to `tel:`/`wa.me`
  - `GET /media/[...key]` — public images (dev storage); private NIC images go
    through `/admin/documents/[id]` with an admin check.
- Services take plain arguments and return plain data, so a future mobile
  app can get a REST/JSON layer by wrapping them — no rewrite.

## 8. Authentication

- Phone number → 6-digit OTP (5 min expiry, 5 attempts, stored as HMAC).
- `SmsProvider` interface; `ConsoleSmsProvider` in development (code is
  also shown on screen in dev). A Sri Lankan gateway (e.g. Notify.lk,
  Dialog/Mobitel, Twilio) plugs in without touching callers.
- Session = random 32-byte token in an `httpOnly`, `SameSite=Lax`,
  `Secure` (prod) cookie; only its SHA-256 is stored. 60-day rolling expiry.
- One `users` table for everyone. A user is a provider if a `providers` row
  exists; admin is a flag. No passwords, no email.
- Rate limits (DB-backed, no Redis): 3 codes per phone per 15 min, 10 per IP
  per hour.
- Phone normalisation accepts `077 123 4567`, `+94771234567`,
  `94771234567`, `0771234567`.

## 9. Location & search

**Location**

- `towns` table (Matara & Galle districts at launch, plus neighbouring towns;
  national list later) with centroids.
- Customer location = a town. "Use my location" asks the browser once,
  rounds to ~1 km on the client, picks the nearest town server-side, and
  stores only the town slug in a cookie.
- `LocationProvider` interface (`nearestTown`, `searchTowns`) with a
  static-table implementation. Swapping to a geocoding API later is local.
- Distance = haversine between the customer's town and provider's town,
  computed in SQL. No PostGIS until scale needs it.

**Search**

- Each category has `search_terms` ("tap", "leak", "pipe", "toilet",
  "water motor"…). A small matcher normalises the query, scores categories
  by term/phrase hits, and falls back to provider name/service text
  (`ILIKE`, with `pg_trgm` added when the table is large enough to need it).
- Search terms are editable in admin, so we learn from logged queries and
  add words without deploys.
- Sinhala/Tamil search terms go in the same array later.

**Ranking** (a sort key, not a black-box score — easy to explain and tune):

1. Taking work today (`available_until > now()`)
2. Distance band: ≤ 3 km, ≤ 8 km, ≤ 15 km, beyond
3. Verified
4. Bayesian rating: `(sum + 4.0 × 3) / (count + 3)` so one 5★ review
   doesn't beat thirty 4.8★
5. Responsiveness proxy: `last_active_at` (a provider who opened the app
   recently is more likely to answer). Replaced by real answer-rate data
   when we can measure it.

Only providers whose service radius covers the customer's town are shown.
If fewer than 3 match, widen to 25 km and say so.

## 10. Analytics / events

One table, one helper: `track(type, ctx)`.

| Event | Where it's recorded | Key fields |
|---|---|---|
| `SEARCH_PERFORMED` | client, once per results view | query, category, town, result_count |
| `PROVIDER_IMPRESSION` | client, IntersectionObserver ≥ 50% visible, batched | provider, position, source |
| `PROVIDER_PROFILE_OPENED` | client, on profile mount | provider, source |
| `PHONE_REVEALED` | server, `/api/contact` kind=reveal | provider |
| `CALL_CLICKED` | server, `/api/contact` or `/go/call` | provider, source |
| `WHATSAPP_CLICKED` | server, same | provider, source |
| `AVAILABILITY_CHANGED` | server action | provider, props.on |
| `REVIEW_SUBMITTED`, `PROVIDER_SIGNED_UP`, `REPORT_SUBMITTED` | server | … |

- Client-recorded views avoid counting Next.js link prefetches and bots.
- `visitor_id`: random UUID cookie (1 year) set in `proxy.ts`. Returning
  users = visitors seen on more than one day. No third-party analytics, no
  fingerprinting.
- Known bot user-agents are dropped at ingest.
- Indexes: `(type, occurred_at)`, `(provider_id, type, occurred_at)`.
- The same table powers the provider dashboard ("12 people opened your
  profile this week") and admin numbers — which is exactly the data needed
  to price a future lead or subscription plan.

## 11. Verification

- Levels: **Phone verified** (implicit — OTP) → **Approved** (admin checked
  the profile looks real; required to appear in search) → **Verified**
  (NIC checked; shows the badge).
- NIC submission: number + photo of the front.
  - Number validated (old `9 digits + V/X`, new 12 digits), stored only as
    an HMAC (duplicate detection) and last 4 digits (admin reference).
  - Photo stored in **private** storage, viewable only through an admin
    route, and **deleted when a decision is made**.
  - Never shown publicly, never in any API response to non-admins.
- `verifications` table supports more kinds later (business registration,
  police report, trade certificate) without schema change.

## 12. Design system

Principles: a utility, not a landing page. Hierarchy from type and spacing,
not boxes. Dividers before cards. Colour means something.

- **Spacing**: 4 px base; screen gutter 20 px on phones, 32 px tablet.
- **Radius**: 6 px controls, 10 px sheets/photos. Nothing pill-shaped except
  the availability switch (it's a physical metaphor).
- **Elevation**: none by default. Only bottom sheets and the sticky call bar
  get a shadow, because they float over content.
- **Lines**: 1 px warm-grey dividers do most of the separating.
- **Icons**: Phosphor (regular weight), used only where they carry meaning —
  categories, call, WhatsApp, verified, location. No decorative icons.
- **Touch targets**: ≥ 48 px for primary actions; Call bar is 56 px.
- **Motion**: 150 ms opacity/transform on sheets and the switch; respects
  `prefers-reduced-motion`.

## 13. Typography

- **Schibsted Grotesk** (Google Fonts, self-hosted by `next/font`). A
  grotesque drawn for a newspaper: sturdy, a little warm, very legible, not
  the default "startup" face. One family, weights 400/500/600/800.
- Sinhala/Tamil: `Noto Sans Sinhala` / `Noto Sans Tamil` in the fallback
  stack, loaded only for those locales.
- Scale (px, mobile → desktop): 13 caption · 15 secondary · 17 body ·
  20 section · 26 page title · 34/44 home H1. Tight tracking (−0.02em) on
  headings only; body at normal tracking.
- Numbers (ratings, stats, prices) use tabular figures.
- **Wordmark**: "Handy" in deep green + "Estate" in orange, set in
  Schibsted Grotesk ExtraBold, tightened, matching the uploaded logo. The
  full illustrated logo is used where there's room (join page, app icon,
  social); the header uses the pure wordmark so it stays crisp at 20 px.

## 14. Colour

Taken from the logo, restrained in use.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#14201C` | Text |
| `ink-2` | `#56615C` | Secondary text (AA on paper) |
| `ink-3` | `#7C8581` | Tertiary, placeholders (≥ 3:1 for large/UI) |
| `paper` | `#FAF8F4` | App background (warm, not clinical white) |
| `surface` | `#FFFFFF` | Inputs, sheets |
| `line` | `#E6E2DA` | Dividers |
| `brand` | `#0E4B3C` | Primary buttons, Call, links, focus ring |
| `brand-tint` | `#E7EFEB` | Selected states, avatar fill |
| `accent` | `#E9771E` | Wordmark "Estate", location pin — nowhere else |
| `live` | `#16804A` | "Taking work today" dot/text only |
| `danger` | `#B3261E` | Destructive admin actions, errors |

The accent is deliberately rare so it keeps meaning. No gradients anywhere.

## 15. Component architecture

```
src/components/ui/        Button, LinkButton, Field, Switch, Sheet, Stars, Divider, Avatar
src/components/brand/     Wordmark, Mark
src/components/provider/  ProviderRow, AvailabilityLabel, ContactButtons, ServiceList,
                          TagSummary, ReviewItem, PhotoStrip
src/components/search/    SearchBox, CategoryGrid, AreaPicker
src/components/layout/    AppHeader, BottomNav, Page
src/components/track/     TrackOnMount, ImpressionTracker
src/lib/i18n/             dictionaries (en complete; si, ta scaffolded) + t()
src/server/db/            schema, client
src/server/services/      auth, otp, sms, storage, location, search, events, providers, reviews
```

- Server Components by default; client components only for interactivity
  (switch, sheets, contact buttons, trackers, forms with state).
- No UI kit. A small set of our own primitives keeps the look ours.

## 16. Responsive behaviour

Designed at 390 px first.

| | Phone (< 640) | Tablet (640–1023) | Desktop (≥ 1024) |
|---|---|---|---|
| Home | Stacked: H1, search, 2-col category grid, available-today list | Category grid 4 cols | Two columns: H1 + search left, categories right; list below |
| Results | Single list; Call button in each row | Same, wider rows with services visible | List (max 760) + area/category rail |
| Profile | Sticky bottom Call bar | Same | Two columns; contact panel sticky on the right, no bottom bar |
| Nav | Bottom bar | Bottom bar | Header links |

## 17. Accessibility

- Semantic landmarks (`header`, `main`, `nav`), one `h1` per page, lists
  as `ul`.
- Contrast: body ≥ 7:1, secondary ≥ 4.5:1, controls ≥ 3:1.
- Visible focus: 2 px brand outline with offset on every interactive
  element (`:focus-visible`).
- Switch is a real `button role="switch" aria-checked`.
- Star input is a radio group; rating display has text ("4.8 out of 5,
  37 reviews").
- Sheets trap focus, close on Escape, restore focus.
- Forms: labels (not placeholders), `inputmode="numeric"` +
  `autocomplete="one-time-code"` for OTP, errors linked with
  `aria-describedby`.
- `lang` attribute follows locale; everything works at 200 % zoom.

## 18. Security

- OTP: HMAC-stored codes, expiry, attempt caps, per-phone & per-IP limits.
- Sessions: hashed tokens, httpOnly cookies, server-side revocation.
- Authorisation checked inside every Server Action / route (never trust
  hidden inputs for ownership).
- NIC: HMAC + last 4 only; private document store; admin-only access;
  deletion after decision.
- Contact endpoint rate-limited per visitor to slow number scraping; numbers
  aren't in list HTML.
- Uploads: size limits, decoded & re-encoded with `sharp` (strips EXIF/GPS,
  rejects non-images), random keys.
- Review abuse: one review per signed-in user per provider; admin can hide;
  `had_contact` recorded for future enforcement.
- Secrets via env; nothing sensitive in client bundles.

## 19. MVP boundaries & challenges to the brief

**In:** the loop (search → results → profile → call/WhatsApp), OTP,
reviews, provider onboarding + dashboard, NIC verification, admin, events,
English UI with i18n plumbing, seed data.

**Challenged / simplified**

1. *"Available now" vs "today"* — one daily switch that expires at
   midnight. Two states would be stale most of the time.
2. *NIC during signup* — moved after signup. Admin approval gates listing;
   the badge rewards NIC. Keeps signup short.
3. *Separate phone-reveal step* — tapping Call **is** the reveal on phones.
   "Show number" exists for desktop users and is logged separately.
4. *Responsiveness ranking* — no data exists yet; use recency of activity
   until we can measure answer rate.
5. *Separate availability/location/event tables* — collapsed (see §6).
6. *Customer accounts* — only for reviews. Browsing and calling never ask.
7. *Review restriction to contacted users* — record `had_contact` now,
   enforce later once enough traffic flows through the Call button.
8. *Sinhala/Tamil* — plumbing + dictionaries now; translated copy should be
   written by native speakers, not machine-generated, before switching on.
9. *Maps* — none. A map adds cost and cognitive load; towns + km are
   clearer for this audience.

## 20. Implementation phases

1. **Foundation** — Next.js 16, Tailwind 4 tokens, fonts, i18n, Drizzle
   schema + migrations, seed (fictional Southern Province data).
2. **Core loop** — home, area picker, search matcher + ranking, results,
   profile, contact endpoint, event tracking.
3. **Accounts & reviews** — OTP, sessions, review flow.
4. **Providers** — join, progressive setup, dashboard switch & stats,
   profile/photo editing, NIC submission.
5. **Admin** — approvals, verification, suspension, categories, reviews,
   reports, metrics.
6. **Polish** — responsive passes, empty/error states, a11y audit,
   screenshots at 390/768/1280, unit tests for matcher/ranking/phone/NIC.

---

## Complexity review (second pass)

Removed or deferred after re-reading the plan:

- ~~Separate REST API~~ → Server Actions + 3 small route handlers.
- ~~Redis rate limiting~~ → counts from Postgres; fine at beta volume.
- ~~PostGIS~~ → haversine on ~10³ rows.
- ~~Full-text search engine~~ → term matcher + `ILIKE`.
- ~~Object storage in dev~~ → `Storage` interface with a local-disk driver;
  S3/R2 driver is a single file later.
- ~~Provider pin location~~ → town centroid.
- ~~Availability history table~~ → events.
- ~~Customer profiles / favourites~~ → device-local "Recent".
- ~~Admin roles & permissions~~ → one `is_admin` flag.
- ~~Notifications (SMS to providers on each lead)~~ → later; costs money
  per SMS and needs opt-in.
- ~~Email~~ → not collected at all.

What remains is the smallest system that can run a real beta in Matara and
Galle and tell us, with data, what to charge for later.

---

## Implementation status (beta build)

All six phases are implemented. Notes where the build refined the plan:

- **Contact hand-off** — the Call button asks `/api/contact` for the number (recording
  `CALL_CLICKED`) and then opens the dialer; numbers never appear in page HTML. Without JS the
  same link goes through `/go/call/[id]`, which records and redirects. WhatsApp always uses `/go`.
- **Search matching** — unit tests caught "fridge not cooling" mapping to AC; symptom phrases are
  now anchored to the device ("ac not cooling"). Add new words in Admin → Categories, guided by
  Admin → "Searches with no results".
- **Uploads** — photos are downscaled in the browser before upload (mobile data), then re-encoded
  server-side with sharp (strips EXIF/GPS). NIC photos go to private storage and are deleted on decision.
- **Seed data** — 32 fictional providers across 23 Southern Province towns, reviews, and two weeks
  of synthetic events so the dashboards and admin metrics have shape in development.
- **Localisation** — every string is in `src/lib/i18n/en.ts`; Sinhala/Tamil files exist and fall
  back to English. They stay switched off (`ENABLED_LOCALES`) until native speakers write the copy.
