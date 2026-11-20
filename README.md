# Yelpy's

A restaurant finder built on real data: Google Places for search and
location, Gemini for turning a restaurant's surroundings into a short,
curated "things to do nearby" plan. Sign in with Google, search, save
favorites, and they follow your account everywhere you sign in.

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** Postgres (Neon), via Prisma 7 with driver adapters
- **Auth:** Better Auth, Google OAuth
- **External APIs:** Google Places API (New), Gemini API (`@google/genai`)
- **Styling:** Tailwind v4
- **Testing:** Vitest (unit), Playwright (e2e)

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy these into `.env.local` (app runtime) and `.env` (CLI/migrations -
see the comment in `prisma.config.ts` for why they're split):

| Variable | Used by | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Prisma CLI (`prisma migrate`) | Neon's **direct** connection string - migrations need session-level features a pooler doesn't support |
| `DATABASE_URL_POOLED` | The app at runtime | Neon's **pooled** connection string |
| `GOOGLE_PLACES_API_KEY` | `lib/places.ts` | Places API (New) - Text Search + Nearby Search |
| `GEMINI_API_KEY` | `lib/gemini.ts` | Gemini API |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | `lib/auth.ts` | Google OAuth client, for sign-in |
| `BETTER_AUTH_SECRET` | `lib/auth.ts` | Session cookie signing key |
| `BETTER_AUTH_URL` | `lib/auth.ts` | Set explicitly for local dev (`http://localhost:3000`); left unset on Vercel, where it falls back to `VERCEL_BRANCH_URL` instead |

None of these are needed to run the test suite - see below.

### Database

```bash
pnpm db:migrate   # apply migrations locally (prisma migrate dev)
pnpm db:studio    # browse the database
```

## Testing

```bash
pnpm lint         # eslint
pnpm exec tsc --noEmit
pnpm test         # vitest - unit tests, no network or database
pnpm test:e2e     # playwright - one e2e test, signed-out landing page only
```

All four run in CI (`.github/workflows/ci.yml`) on every push and PR,
with no secrets configured - confirmed empirically that neither
`prisma generate` nor the e2e test needs a real database or API keys.

## How it fits together

- **Search** (`app/api/places/search/route.ts`) calls the Places API,
  caches results in Postgres for 24h, and is rate-limited per user.
- **Saved restaurants** (`app/api/saved/`) persist per-user in Postgres,
  so favorites follow an account across devices and sign-ins.
- **Outing plans** (`app/api/restaurants/[placeId]/nearby/route.ts`)
  fetch real nearby places from the Places API, hand the candidates to
  Gemini to narrate into a short plan, and filter Gemini's picks
  against the real candidate list to rule out hallucinated places.
  Cached for 7 days per restaurant.
- **Auth** is Better Auth with Google as the only provider; sessions
  are Postgres-backed via the Prisma adapter.

## Deployment

Deployed on Vercel, connected to this GitHub repo. `main` is the
production branch; every other branch gets its own preview deployment
automatically. Production needs its own copies of every environment
variable above, set in the Vercel dashboard and scoped to the
Production environment (not Preview).
