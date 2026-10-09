# Project instructions

Read `docs/UI_REQUIREMENTS.md` before UI work. Preserve the user's agreed design and run the relevant responsive matrix before reporting completion. Record exceptions and browser/device limitations honestly. Do not push or deploy without user authorization.

For changes deployed to Vercel, run `npx next build` in addition to any local Vinext build. Vercel uses Next.js; a passing Vinext build alone is not production verification. Keep `'use client'` before all imports in Client Components.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
