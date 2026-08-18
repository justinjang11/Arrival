---
name: allowedDevOrigins fix
description: next.config.ts reads REPLIT_DEV_DOMAIN and populates allowedDevOrigins to prevent Next.js 16.3.1 cross-origin 403s in the Replit preview iframe.
---

# allowedDevOrigins Fix in next.config.ts

## Rule
Do not modify `next.config.ts`. The file contains a carefully crafted `allowedDevOrigins` configuration that fixes React hydration failures in the Replit preview pane.

**Why:** Next.js 16.3.1 introduced stricter origin checking. The Replit preview is a proxied iframe — requests arrive from a different origin than the dev server. Without `allowedDevOrigins` including the `REPLIT_DEV_DOMAIN` hostname, Next.js returns 403s, blocking React hydration.

**How it works:**
- Reads `process.env.REPLIT_DEV_DOMAIN` at build/start time.
- Strips any `https://` prefix to get the bare hostname.
- Adds it to `allowedDevOrigins` only when the env var is present (production-safe).

**How to apply:**
- Do not touch `next.config.ts` in any task unless the task is explicitly about fixing the preview/hydration setup.
- If the preview stops working, check that this file hasn't been modified before looking elsewhere.
