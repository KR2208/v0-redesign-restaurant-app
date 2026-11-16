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
  // NOTE: works for local dev as-is. Preview/production deployments each
  // have their own URL, so this needs a per-environment value before
  // Sheet 08 — flagging now rather than letting it surface as a mystery
  // "redirect mismatch" later.
  baseURL: process.env.BETTER_AUTH_URL,
})
