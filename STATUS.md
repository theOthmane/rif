# STATUS — RIFANO theme repo setup

Date: 2026-10-10

## Done
1. Moved `rifano-logo.PNG` -> `brand/`, `Watch-1..4.png` -> `brand/watches/` (unmodified).
2. Skeleton theme cloned into `theme/` (via `npx @shopify/cli@latest`; global `shopify` binary is broken). No `theme/.git` remained.
3. Installed Impeccable for OpenCode (project scope, engine v0.1.14) into `.opencode/`; installed `design-taste-frontend` into `.agents/skills/` (symlinked from `.claude/skills/`); cloned scroll-craft into `tools/scroll-craft/` (gitignored); ran doctor.
4. `.gitignore`: node_modules/, .env, tools/scroll-craft/, scrollcraft/builds/, .shopify/, plus the Impeccable ignore block.
5. git init, remote `https://github.com/theOthmane/rif.git`, branch `main`, commit `8c04487` "chore: skeleton theme + tooling", pushed.
6. Theme check run.
7. This file.

## Theme-check result
`shopify theme check --path theme`: 26 files inspected with no offenses found.

## Doctor result (scroll-craft preflight)
- ok   node v22.22.1
- ok   ffmpeg (full build, 566 filters), libwebp encoder present
- warn playwright-core not installed (only needed for verification pass; `npm i playwright-core` in the build folder)
- warn Chrome not found (install Chrome or set SCROLLCRAFT_CHROME)
- warn KIE_AI_API_KEY not set (only needed to generate imagery)
- ok   workspace at ./scrollcraft; warn registry not created yet (`node scripts/workspace.mjs --ensure`)
Result: Ready, with 4 optional items missing.

## Open issues
- Global `@shopify/cli` install is broken (no `shopify` on PATH); use `npx @shopify/cli@latest`.
- playwright-core and Chrome missing for scroll-craft verification pass.
- `.impeccable` design context not initialised yet: run `/impeccable init` in the agent chat.
- `.claude/skills/design-taste-frontend` is a symlink; may misbehave on Windows checkouts.
- This updated STATUS.md is not yet committed (pushed commit contains the earlier blocked-state version).
