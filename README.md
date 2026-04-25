# Support CNDA — Donation Telecast

Live donor-name display + admin entry for the CNDA fundraising broadcast.

- **`/`** — full-screen telecast view: QR + manual `total_raised` counter on the
  left, Zeffy thermometer iframe under it, and floating donor names on the right.
- **`/admin`** — password-gated form for adding donor names, updating the
  manual total, and updating the goal. Mobile-friendly.

## Stack

- Next.js 15 (App Router) + TypeScript
- Supabase (Postgres + Realtime)
- Tailwind CSS
- Deploy: Vercel

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Supabase**

   Run `supabase/migrations/0001_init.sql` in your Supabase SQL editor.
   This creates `donors` and `settings` tables, RLS policies (anon `select`
   only), and registers both tables for Realtime.

3. **Env vars** — copy `.env.local.example` to `.env.local` and fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ADMIN_PASSWORD=
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` for the display, `http://localhost:3000/admin`
   for the admin entry page.

## Regenerating the QR code

`public/qr-code.png` is generated from the Zeffy donation URL. To regenerate
(e.g. if the URL changes):

```bash
npm run qr
```

Then commit the updated PNG.

## Deploy to Vercel

1. Push this repo.
2. Import in Vercel.
3. Add the four env vars above to the Vercel project (all four for both
   Production and Preview).
4. Deploy.

## Notes

- `total_raised` is **manually updated** by the operator — Zeffy doesn't push
  webhooks on the free tier. The Zeffy thermometer iframe shows the live
  on-platform progress; the big counter shows the manually-entered figure.
- The display fetches existing donors on load but does **not** animate them —
  only newly-inserted donors trigger the float-up. IDs already seen are tracked
  in a ref so a refresh doesn't replay everything.
- There is no link from `/` to `/admin`. Admins must type `/admin` directly.
