# ChainsXes World

Personal React web app for ChainsXes's homepage, essays, music, photography, AI, and Web3 notes.

## Local Development

```powershell
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

The app still renders without these values, but cloud essays/photos are disabled until Supabase is configured.

## Supabase Setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. In Authentication, enable email OTP/magic-link login.
4. Add the deployed GitHub Pages URL to the Supabase Auth redirect URLs:
   `https://<github-username>.github.io/chainsxes-world/`

Admin editing is restricted by RLS to:

```text
694586386@qq.com
```

Visitors can read published essays/photos only.

## GitHub Pages Deployment

Create a public GitHub repository named `chainsxes-world`, push the `main` branch, and enable Pages with GitHub Actions.

Add these repository settings before the first production deploy:

```text
Repository variable: VITE_SUPABASE_URL
Repository secret:   VITE_SUPABASE_ANON_KEY
```

The deployment workflow is `.github/workflows/deploy.yml`. The Vite base path is configured as `/chainsxes-world/`, so the final URL will be:

```text
https://<github-username>.github.io/chainsxes-world/
```
