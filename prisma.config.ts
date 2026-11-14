// Config for the Prisma CLI (migrate, studio, generate) — NOT read at app
// runtime. Prisma 7's generated client no longer loads .env itself, and the
// CLI only auto-loads a plain `.env`, so we load it explicitly here. Our
// DATABASE_URL lives in `.env` (gitignored) rather than `.env.local` for
// exactly this reason — see the comment in lib/prisma.ts for the runtime side.
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
})
