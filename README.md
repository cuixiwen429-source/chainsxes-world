# ChainsXes World

A static bilingual personal website for ChainsXes.

The site is built with Vite, React, Framer Motion, Tailwind CSS, and Spline. It no longer uses Supabase or any database-backed media storage. Essays are text-only and saved locally in the browser through a lightweight admin console.

## Spline 3D Background

The full-page monochrome 3D atmosphere uses the Vite/React package entry:

```jsx
import Spline from "@splinetool/react-spline";
```

Scene URL:

```text
https://prod.spline.design/oOoC9vJEelZs4iIK/scene.splinecode
```

The Spline layer is lazy-loaded and has a CSS black-and-white glass fallback so the page still has a designed background if the external scene is slow or unavailable.

## Local Development

```powershell
npm install
npm run dev
```

The local URL uses the configured Vite base path:

```text
http://127.0.0.1:5173/chainsxes-world/
```

## Static Admin Notes

The admin console is a front-end-only tool:

- Admin email: `694586386@qq.com`
- Local admin key: `chainsxes-local-admin`
- Essays are stored in `localStorage` in the current browser.
- Use the JSON export/import buttons to back up or move notes.

Because this is a static website, the admin key is not a real security boundary. A real private publishing system would require a backend.

## GitHub Pages Deployment

The deployment workflow is `.github/workflows/deploy.yml`. The Vite base path is configured as `/chainsxes-world/`, so the production URL is:

```text
https://cuixiwen429-source.github.io/chainsxes-world/
```
