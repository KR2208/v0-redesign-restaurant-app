import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Temporary — verifying the database actually connects from Vercel's
// environment, not just locally. Removed right after we confirm this.
export async function GET() {
  const rows = await prisma.cachedSearch.findMany()
  return NextResponse.json({
    count: rows.length,
    rows: rows.map((r) => ({
      key: r.key,
      fetchedAt: r.fetchedAt,
      resultCount: Array.isArray(r.results) ? r.results.length : null,
    })),
  })
}
