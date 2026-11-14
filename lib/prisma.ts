import { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// Prisma 7: the client connects through a driver adapter, not a bare
// connection string on the datasource block. This reads DATABASE_URL_POOLED
// from whatever already populated process.env — in this Next.js app that's
// Next's own .env / .env.local loading, which runs before any route handler
// code, so no dotenv import is needed here (unlike prisma.config.ts, which
// runs outside Next and has to load it itself).
//
// Deliberately POOLED, not DATABASE_URL: this file is what every API route
// uses on every request. DATABASE_URL (direct) is reserved for the CLI —
// see prisma.config.ts — because `prisma migrate` needs session-level
// features a connection pooler doesn't support.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED })

// Next.js dev hot-reloads route modules but keeps the Node process alive,
// so a plain `new PrismaClient()` at module scope would mint a fresh
// connection pool on every edit and eventually exhaust Postgres's
// connection limit. Caching the instance on `globalThis` survives the
// reload; production gets a clean instance per cold start as normal.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
