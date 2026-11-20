import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma client - not our code to lint.
    "lib/generated/**",
    // Unmodified shadcn/ui scaffold from the original v0 export - not
    // code we wrote, and components/ui/use-mobile.tsx + use-toast.ts
    // are literal duplicates of hooks/use-mobile.ts + use-toast.ts
    // (left over from that export, not something we're using on purpose).
    "components/ui/**",
    "hooks/**",
    // v0-sandbox-only tooling (hardcodes a /vercel/share path) - not
    // relevant outside that environment.
    "scripts/**",
  ]),
])

export default eslintConfig
