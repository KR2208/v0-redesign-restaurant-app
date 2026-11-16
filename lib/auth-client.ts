import { createAuthClient } from "better-auth/react"

// No baseURL passed deliberately — it defaults to the page's own origin,
// so this works unmodified on localhost, every Vercel preview, and
// production alike, without a different value needed per environment.
export const authClient = createAuthClient()
