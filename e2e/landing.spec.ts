import { test, expect } from "@playwright/test"

// Scope note: this only covers the signed-out landing page itself, not the
// Google OAuth redirect that "Sign in with Google" triggers. Clicking that
// button makes Better Auth write a pending session row, which needs a real
// DATABASE_URL (and OAuth client secrets) to succeed - we don't want those
// in CI, so this test stays to what's true with zero external services:
// the landing page renders correctly for a signed-out visitor.
test("shows the sign-in landing page to a signed-out visitor", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "Yelpy's" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible()

  // Never resolves into the authenticated app view for a signed-out visitor.
  await expect(page.getByText("Signed in as")).not.toBeVisible()
})
