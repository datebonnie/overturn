# Overturn — marketing landing page

Marketing site for **Overturn** (hioverturn.com). Next.js 15 (App Router,
TypeScript strict, Tailwind v4), deployed to Vercel.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Project layout

```
src/
├── app/
│   ├── layout.tsx              # Geist fonts, SEO metadata, OG image link
│   ├── page.tsx                # Composes sections + JSON-LD (Org + FAQ)
│   ├── globals.css             # Tailwind v4 theme tokens (navy + accent)
│   ├── opengraph-image.tsx     # Generated 1200×630 OG image
│   ├── robots.ts
│   ├── sitemap.ts
│   └── api/waitlist/route.ts   # POST handler — Supabase, console fallback
├── components/
│   ├── reveal.tsx              # Scroll fade-in wrapper
│   ├── faq-item.tsx            # Accessible accordion item
│   ├── waitlist-form-inline.tsx
│   └── sections/               # nav, hero, problem, how-it-works, …
├── hooks/use-reveal.ts         # IntersectionObserver
└── lib/
    ├── content.ts              # All page copy in one file
    └── supabase.ts             # Server-only client, gated on env
```

All copy lives in `src/lib/content.ts`.

## Environment

Copy `.env.local.example` → `.env.local` and fill once Supabase keys are
provisioned. Until then, `/api/waitlist` logs payloads to the server
console and returns success.

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

When connected, signups insert into a `waitlist` table with columns:
`email`, `practice_name`, `role`, `specialty`, `claim_volume`, `source`,
`created_at`.

## Deploy to Vercel

First-time deploy from this repo:

```bash
npm i -g vercel
vercel login
vercel link             # answer prompts: scope, link to existing or create new
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod           # production deploy
```

Subsequent deploys: push to your linked Git remote (Vercel auto-deploys),
or run `vercel --prod` from CLI.

### Connect hioverturn.com

```bash
vercel domains add hioverturn.com
vercel alias set <deployment-url> hioverturn.com
vercel alias set <deployment-url> www.hioverturn.com
```

Then in your DNS provider, set:

- `A  @       76.76.21.21`
- `CNAME  www  cname.vercel-dns.com`

(Or use Vercel nameservers if you want them to manage DNS.)

Verify in the Vercel dashboard under **Domains** that the cert provisions.
