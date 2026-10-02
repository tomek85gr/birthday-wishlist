# Birthday Wishlist

A small Greek language birthday invitation and gift reservation app. Guests need no account. Public pages receive only safe gift fields; reservation emails stay server-side for the admin.

## Database choice

The app uses Cloudflare D1, a hosted SQLite database, through Cloudflare's server-side D1 query API. This preserves Vercel hosting without relying on a local SQLite file: Vercel Functions have a read-only filesystem and only temporary `/tmp` storage. Cloudflare's Workers Free plan includes D1 with daily usage limits. If those limits are exceeded, queries stop until the next daily reset; unused databases are not paused just because they had no traffic.

## Requirements

- Node.js 20.9 or later
- A free Cloudflare account with D1 enabled
- A Vercel account (the Hobby plan is sufficient for personal use within its limits)
- npm

## Create the D1 database

1. In the [Cloudflare dashboard](https://dash.cloudflare.com/), create a D1 database named `birthday-wishlist`.
2. Open the database's **Console** and run the SQL in `db/migrations/0001_initial.sql`.
3. In your Cloudflare profile, create an API token with **Account → D1 → Read and Write** permissions, scoped to the account that owns this database. Store the token as a secret.
4. Copy the Cloudflare account ID and database UUID from the dashboard.

The app sends parameterized SQL to D1 from server code. The Cloudflare token is never sent to a browser. Do not expose it as a `NEXT_PUBLIC_` variable.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```env
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_D1_DATABASE_ID=your-d1-database-id
CLOUDFLARE_API_TOKEN=your-d1-read-write-token
NEXT_PUBLIC_SITE_URL=http://localhost:8001
```

`NEXT_PUBLIC_SITE_URL` is used by the seed script to print the admin URL. Set it to your public HTTPS site URL in Vercel.

## Run locally

```bash
npm install
npm run dev
```

Local development uses the same hosted D1 database, so set the environment variables first. To insert the sample birthday and fake products, run:

```bash
npm run seed
```

It prints the public page `/nefelis-genethlia` and a newly generated private admin URL. Save that admin URL. Rerunning the seed resets the sample gifts and rotates the admin secret. The demo gift URLs point to `example.com`; they are labeled as sample products and are not invented retailer listings.

The development script is `"dev": "next dev --port 8001"` in `package.json`. Open [http://localhost:8001](http://localhost:8001). Local and live apps use whichever D1 database is configured in `.env.local`; use a separate D1 database for local testing if you want to keep test data separate from the live site.

## Deploy to Vercel

1. Create a GitHub repository and push this project to it.
2. In Vercel, choose **Add New → Project**, import the GitHub repository, and keep the default Next.js build settings.
3. In Vercel project settings, add `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, and `CLOUDFLARE_API_TOKEN`. Add `NEXT_PUBLIC_SITE_URL` with the Vercel production URL, such as `https://your-project.vercel.app`. Keep the API token server-only.
4. In Cloudflare D1's **Console**, apply `db/migrations/0001_initial.sql` if you have not already done so.
5. Deploy from Vercel. Open the deployed site, create a birthday page, then use its admin link to add gifts. Share the public birthday URL with guests and keep the admin URL private.
6. Optional: run `npm run seed` locally with the production D1 environment variables to add the demo birthday. This writes to the live database and resets any existing demo gifts.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architecture

- Next.js App Router renders the public birthday page on the server.
- `src/lib/database.ts` sends parameterized queries to Cloudflare D1's API.
- `src/lib/birthdays.ts` owns birthday lookup, safe public DTOs, and atomic reservations.
- Reservations update only rows whose `claimed_at` is `NULL`, so concurrent guests cannot both reserve the same gift.
- The public gift query does not select `claimed_by_email`.
- Admin mutations check the birthday's high entropy secret on the server.
- Metadata preview fetches standard HTML metadata only, validates redirects and public IPs, and caps response size and request time.
- Invitation images can be uploaded as PNG, JPG, or WebP. The browser resizes them to a small JPEG and stores the image in D1, so no separate image-hosting account is needed.
- Admins can clear reservation emails without clearing a gift's claimed status.

The app does not process payments, verify purchases, send email, or collect marketing consent. D1's free tier has service limits; check Cloudflare's current [D1 limits](https://developers.cloudflare.com/d1/reference/faq/) before a large event or public launch.
