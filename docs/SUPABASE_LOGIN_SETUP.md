# Supabase login and watchlist setup

The app includes Google OAuth, email magic-link login, and per-account watchlist syncing. It remains usable without Supabase credentials; login reports that setup is required.

## 1. Create the Supabase project

Create a project at https://supabase.com/dashboard and copy the Project URL and publishable/anon key from Project Settings → API. Add these variables to `.env.local` for local development, and to Vercel Project → Settings → Environment Variables for Production and Preview:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

These are public client configuration values. Never put a service-role key in a `NEXT_PUBLIC_` variable or in browser code.

## 2. Enable Google OAuth

In Supabase Authentication → Sign In / Providers, enable Google. In Google Cloud Console, create an OAuth client (Web application), add the Supabase callback URL shown by Supabase as an Authorized redirect URI, and enter the Google Client ID and Client Secret in Supabase.

In Supabase Authentication → URL Configuration, set the Site URL to the production Vercel URL and add these Redirect URLs:

- `http://localhost:3000/auth/callback`
- `http://127.0.0.1:3000/auth/callback`
- `http://localhost:5173/auth/callback` (current local dev server)
- `http://127.0.0.1:5173/auth/callback` (current in-app browser URL)
- `https://YOUR_PRODUCTION_DOMAIN/auth/callback`
- `https://YOUR_PREVIEW_DOMAIN/auth/callback` (if using Preview deployments)

Google sign-in and email magic links both return through `/auth/callback`.

## 3. Create the private watchlist table

Open Supabase SQL Editor and run [`../supabase/schema.sql`](../supabase/schema.sql). Row Level Security is enabled and policies restrict each row to its owning authenticated user.

## 4. Run and deploy

Restart the local dev server after adding `.env.local`, then test Google and email login and verify that adding/removing a stock syncs after signing in. Add the same two environment variables to Vercel and redeploy. No key belongs in GitHub.
