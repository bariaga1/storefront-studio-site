<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Storefront Studio

Consulting workspace for brick-and-mortar shops that need an online presence, cleaner data, or help scaling.

## How inquiries work

Shop owners submit the public form. Each submission creates a folder:

`clients/{business-slug}-{yyyy-mm-dd}/`

That folder is the source of truth for the engagement. Start there. Do not invent a CRM, database, or client login unless asked.

## Working a client folder

1. Open the newest folder in `clients/` (ignore `_template`).
2. Read `CONTEXT.md` first, then `inquiry.md`.
3. Put working notes in `notes.md`. Append dated entries; do not overwrite earlier notes.
4. Do not invent facts that are not in the inquiry. If something is missing, list it as an open question.
5. Prefer the smallest change a shop owner can keep using. Do not assume they want an app, a redesign, or a social strategy unless they said so.

## Folder files

- `inquiry.md` — verbatim submission (who, contact, what they asked).
- `CONTEXT.md` — structured brief and likely workstreams. Read this first.
- `notes.md` — consultant and agent working notes.

Copy `_template` only if you are creating a folder by hand. The intake API writes these files for you.
