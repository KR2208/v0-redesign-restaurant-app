import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { unauthenticated } from "@/lib/api-errors"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return unauthenticated()
  }

  const { placeId } = await params

  // deleteMany, not delete - deleting something already gone (double
  // click, stale UI) is a no-op, not a 404 to handle specially.
  await prisma.savedRestaurant.deleteMany({
    where: { userId: session.user.id, placeId },
  })

  return NextResponse.json({ ok: true })
}
