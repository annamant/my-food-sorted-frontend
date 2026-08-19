# Stack and file map

Sibling repos (this workspace):

- Frontend: `my-food-sorted-frontend` (Vite React SPA, Railway, public site)
- Backend: `my-food-sorted-backend` (Express, share JSON + HTML)

## Live

- Canonical site: `https://www.myfoodsorted.com/`
- Apex: `https://myfoodsorted.com/` → 301 www
- Backend origin: `https://my-food-sorted-production.up.railway.app`
- Cloudflare zone: `myfoodsorted.com` (account `92a13ea75c71238d5dc6c97416a6e6e7`)
- Worker name: `soft-term-7b46` (keep this name; routes are bound to it)

## Frontend files

| Path | Role |
|------|------|
| `index.html` | Title, description, canonical, OG, Twitter |
| `src/components/LandingPageSeo.jsx` | Prerendered crawler HTML for `/` |
| `src/components/LandingPage.jsx` | Human landing (JS) |
| `scripts/prerender-landing.tsx` | Injects SEO landing into `dist/index.html` on build |
| `public/robots.txt` | Allow all, sitemap URL |
| `public/sitemap.xml` | Homepage only |
| `public/hero-summer-table.jpg` | OG image asset |
| `src/App.jsx` | `buildShareUrl()` path-based share links |
| `src/components/SharedRecipeView.jsx` | Fetches share JSON with `Accept: application/json` |
| `cloudflare/share-proxy/worker.js` | Apex 301 + `/share/*` proxy |
| `cloudflare/share-proxy/wrangler.toml` | Worker name and routes |
| `package.json` | `"build": "vite build && npx tsx scripts/prerender-landing.tsx"` |

## Backend files

| Path | Role |
|------|------|
| `src/server.ts` | `wantsJsonResponse`, `getCanonicalUrl`, `renderHtmlDocument`, `GET /share/:slug`, `GET /share/list/:slug` |

Share HTML helpers must keep `SITE_ORIGIN = 'https://www.myfoodsorted.com'` and `OG_IMAGE_URL` as the absolute hero image.

## Worker

Source of truth: `cloudflare/share-proxy/` in the **frontend** repo.

Routes:

- `www.myfoodsorted.com/share/*` → proxy to Railway backend
- `myfoodsorted.com/*` → 301 to `https://www.myfoodsorted.com` (same path/query)

Deploy (from frontend repo):

```bash
cd cloudflare/share-proxy && wrangler deploy
```

Wrangler OAuth can write workers/routes. It cannot create Cloudflare Redirect Rules (`zone` write missing). Do not tell the user to use the dashboard Redirect Rule unless they have a fuller API token.

Proxy must forward method/headers/body and set `x-forwarded-host` / `x-forwarded-proto`. Debug header `x-share-proxy: soft-term-7b46` is expected on proxied share responses.

## Deploy notes

- Frontend and backend auto-deploy from `main` on Railway after push.
- Worker does **not** auto-deploy from git. After Worker edits, run `wrangler deploy` from `cloudflare/share-proxy`.
- Homepage crawler HTML only updates after a **frontend production build** (prerender step).
