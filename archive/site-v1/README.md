# KillsComfort Site V1 Archive

Frozen snapshot of the **content-only** production site (no games / no Play feature).

| Field | Value |
| --- | --- |
| **Git tag** | `site-v1` |
| **Git branch** | `archive/site-v1` |
| **Commit** | `103b1fa` — *Remove games and Play feature until full rebuild is ready.* |
| **Archived** | July 2, 2026 |
| **Live URL** | https://www.killscomfort.com |

## What V1 includes

- Marketing homepage: Hero → Who Is → What I Do → Book
- Music, merch, services, events, about, donate, book
- Checkout (Stripe + PayPal), cart, admin dashboard
- Supabase auth, inquiries, newsletter, blog, landing pages
- **No** `/ride` routes, arcade, or Street Run leaderboard

## What's in this folder

```
archive/site-v1/
├── README.md                 ← you are here
├── public-asset-manifest.txt ← list of files under public/ at V1
└── snapshot/                 ← copy of src, supabase, scripts, and root configs
    ├── src/
    ├── supabase/
    ├── scripts/
    ├── package.json
    └── …
```

`public/` (~674 MB, mostly video and about imagery) is **not** duplicated here — it remains in git at tag `site-v1`.

## Restore the full V1 site

From repo root:

```bash
# Option A — checkout the frozen tag (entire repo at V1)
git checkout site-v1

# Option B — restore specific paths onto main without switching branches
git checkout site-v1 -- src public supabase scripts package.json package-lock.json next.config.ts tsconfig.json

# Option C — browse the archive branch
git checkout archive/site-v1
```

After restoring files, run `npm install && npm run build`.

## Compare V1 snapshot to current main

```bash
diff -rq archive/site-v1/snapshot/src src
```

## Notes for V2 (game site)

When dropping in new game code, work on `main` (or a `v2` feature branch). This archive stays read-only — do not edit `archive/site-v1/snapshot/` in place; update the live tree under `src/` instead.
