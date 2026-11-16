import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// Stub for Sheet 05 — this route doesn't do anything real yet. Its only
// job right now is proving the pattern every protected route will use:
// ask Better Auth "is there a session for this request?", and if not,
// stop before any real work happens.
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  return NextResponse.json({ userId: session.user.id })
}
