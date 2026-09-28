# Storefront Studio

A small consulting site for brick-and-mortar shops that are not online yet — or are drowning in paper and busy seasons. Shop owners describe what is stuck. Each inquiry becomes a client folder (so Cursor agents have context) and an email to you.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Submit the form without GitHub or Resend keys and you should still get a folder under `clients/`.

## Environment

Copy `.env.example` to `.env.local`.

Inquiry files include names, emails, and phone numbers, so they never live in this repo. Locally they are written to `clients/`, which is gitignored (except `clients/_template/`). In production, point `GITHUB_REPO` at a **separate private repo** that holds only client folders.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Send you the inquiry ([Resend](https://resend.com)) |
| `CONSULTANT_EMAIL` | Where that email goes |
| `RESEND_FROM` | Optional. Defaults to Resend's onboarding sender for tests |
| `GITHUB_TOKEN` | Fine-grained token with Contents read/write on the private clients repo only |
| `GITHUB_REPO` | Private clients repo, e.g. `owner/storefront-studio-clients` |
| `GITHUB_BRANCH` | Optional. Defaults to `main` |

On Vercel (or any host), local disk does not keep files. Set the GitHub variables so each inquiry is committed to the private clients repo as `clients/{slug}-{date}/`.

## What a submission creates

```
clients/acme-bakery-2026-09-16/
  CONTEXT.md   ← read this first
  inquiry.md   ← verbatim form
  notes.md     ← your working notes
```

`clients/_template/` is the blank version if you ever open a folder by hand.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```
