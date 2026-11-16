import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

// A single catch-all route — this one handler covers every Better Auth
// endpoint (sign-in, callback, sign-out, session check, etc.). Better Auth
// itself decides what each path under /api/auth/* means; we're just
// wiring it into Next's routing.
export const { GET, POST } = toNextJsHandler(auth)
