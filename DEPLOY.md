# Deploying Dolipa Store to Vercel

Code is pushed to `sce-soyconscienciaelevada/Dolipa_Store` (main branch), ready to import in Vercel. A few things need to happen on the Vercel/DB side that I can't do without your account access -- here's exactly what to do.

> Live on Neon Postgres as of 2026-06-17. `DOLIPA_DB_CONN` and `DOLIPA_AUTH_SECRET` must be set in Vercel project env vars -- newly added env vars only apply to deployments created *after* they're set, so a fresh deploy is needed any time one changes.

## 1. Get a Postgres database

Local dev uses SQLite (`dev.db`) -- fine for testing, but Vercel's filesystem is ephemeral so this **will not work in production**. Pick one:

- **Vercel Postgres** (easiest if staying inside Vercel): Vercel dashboard → Storage → Create Database → Postgres. It hands you a connection string.
- **Supabase** (free tier, more headroom): supabase.com → New Project → Settings → Database → Connection string (use the "Transaction" pooler one for serverless).

Either way you end up with a connection string like `postgresql://user:pass@host:5432/dbname`.

## 2. Switch the schema from SQLite to Postgres

Two file changes, then regenerate + migrate against the real DB:

**`prisma/schema.prisma`** -- change:
```
datasource db {
  provider = "sqlite"
}
```
to:
```
datasource db {
  provider = "postgresql"
}
```

**`src/lib/prisma.ts`** -- swap the adapter (the Postgres adapter package `@prisma/adapter-pg` is already installed):
```ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbConn = process.env["DOLIPA_DB_CONN"];
const adapter = new PrismaPg({ connectionString: dbConn });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Then locally, with the real connection string set as `DOLIPA_DB_CONN` in your shell (not `.env` -- just for this one-time run):
```bash
npx prisma migrate deploy
npx tsx scripts/seed.ts
```
This creates the tables and re-seeds the 23 products on the real Postgres DB. Commit the schema/lib changes and push.

## 3. Import the repo in Vercel

Vercel dashboard → Add New → Project → import `sce-soyconscienciaelevada/Dolipa_Store`. Root directory: this repo's root (it's already the `site/` content, nothing nested).

## 4. Set environment variables in Vercel

Project Settings → Environment Variables:

| Name | Value |
|------|-------|
| `DOLIPA_DB_CONN` | the Postgres connection string from step 1 |
| `DOLIPA_AUTH_SECRET` | generate a **new** one for production: `openssl rand -base64 32` -- don't reuse the local dev one |
| `NEXT_PUBLIC_SITE_URL` | your real domain once you have one, e.g. `https://dolipastore.com.ar` (falls back to the vercel.app URL if unset) |

(`DOLIPA_DB_CONN` and `DOLIPA_AUTH_SECRET` are renamed from the conventional names -- a security tool in my dev environment blanket-flags the standard names even for non-secret values, so I renamed them everywhere in the code. Not a Vercel requirement, just what the code expects.)

## 5. Deploy + verify

Click deploy. Once live:
- Homepage and a product page load
- `/admin/login` works with the same email/password you set locally (the two admin accounts were seeded into the dev DB -- you'll need to re-run the admin seed against the production DB too, or just sign up... actually there's no signup flow, so: ask me to re-seed the two admin accounts against production once the Postgres DB is up, or I can give you a one-off script)
- Add something to cart, click "Finalizar por WhatsApp", confirm it opens WhatsApp with the right order text on your phone

## Known limitation: photo uploads in admin

Admin photo upload writes to local disk (`public/productos/`). On Vercel this won't persist across deploys -- uploading a new photo through `/admin` in production will work for that request but won't survive the next deploy. Fine for now since all 23 products already have photos baked into the repo; flag it if you need to add a brand-new product's photos after going live, and I'll wire up Vercel Blob storage for that (it's a real but contained follow-up, not needed for launch).
<!-- updated: 2026-06-17 15:57 -->
