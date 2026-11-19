import { NextResponse } from "next/server"

/**
 * Every API route error, shaped the same way: a human-readable message
 * (what's always been returned) plus a machine-readable code (new) - so
 * a future UI could branch on "RATE_LIMITED" specifically instead of
 * string-matching on message text, which breaks the moment the wording
 * changes.
 */
export const API_ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  UPSTREAM_ERROR: "UPSTREAM_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  UNAUTHENTICATED: 401,
  VALIDATION_ERROR: 400,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  INTERNAL_ERROR: 500,
}

export function apiError(code: ApiErrorCode, message: string) {
  return NextResponse.json({ error: message, code }, { status: STATUS_BY_CODE[code] })
}

// Every route in this app needs this exact one - worth not retyping
// "Not signed in" by hand in five different files.
export function unauthenticated() {
  return apiError(API_ERROR_CODES.UNAUTHENTICATED, "Not signed in")
}
