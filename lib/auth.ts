import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/prisma"

// Server-only. This is the one place that knows how to verify someone's
// identity and issue a session — the route handler and any server code
// that needs "who is this?" both go through this object, never around it.
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  // Locally, BETTER_AUTH_URL is set explicitly (http://localhost:3000).
  // On Vercel we deliberately leave it unset and fall back to
  // VERCEL_BRANCH_URL instead - Vercel's own stable, per-git-branch URL
  // (not per-commit, so it doesn't change on every push). That's what
  // makes a single registered OAuth redirect URI keep working across
  // every future push to this same branch, instead of needing updating
  // each time.
  baseURL: process.env.BETTER_AUTH_URL
    ?? (process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined),
})
