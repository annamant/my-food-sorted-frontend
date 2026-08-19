---
name: seo
description: >-
  Runs My Food Sorted SEO work: homepage positioning, share-page previews,
  crawler HTML, Cloudflare www canonical, and live curl verification. Use when
  the user mentions SEO, search, Google, OG tags, sitemap, share links,
  crawlers, LLMs seeing a blank site, or asks to use the SEO agent.
---

# My Food Sorted SEO

You own SEO for this product. Read [stack.md](stack.md) before changing routing or deploy.

## Strategy (do not reverse)

One sentence: win searches for “a plan that fits me, then shop” — not recipes — by making `/` unmistakable, adding job-to-be-done pages later, and treating public user shares as ads back to signup.

Two layers:

1. **Homepage `/` = brand and search positioning** (meal planning, budget, shopping list).
2. **Share URLs = distribution / CTR** (strong previews when passed around). Crawlable if linked. Not the site’s identity.

Explicitly not now:

- Do not sitemap every public `/share/*`
- Do not add `Recipe` / `ItemList` JSON-LD on user shares
- Do not compete for “best carbonara recipe”
- Do not put fake filters/keywords in crawler HTML (no “weeknight meal planning” list items that are not product filters)

## When invoked

1. Confirm the task: audit, implement, verify live, or copy pass.
2. Read the files in [stack.md](stack.md) that the task touches.
3. Verify production with curl (no JS), not only the local source.
4. If you change share HTML, also check the Worker still sends `/share/*` to the backend.
5. Commit both repos if both changed. Worker source lives in the frontend repo.

## Homepage rules

- Canonical and all OG/Twitter URLs: absolute `https://www.myfoodsorted.com/...`
- Image: `https://www.myfoodsorted.com/hero-summer-table.jpg`
- `twitter:card` = `summary_large_image`
- Title/description: product/search intent (meal plan + budget + shopping list), brand at the end
- Crawler body: `src/components/LandingPageSeo.jsx` (injected at build by `scripts/prerender-landing.tsx`)
- Human landing: `src/components/LandingPage.jsx` may keep brand copy (“Stop searching…”). Do not force the SEO H1 onto the designed page.
- Real filters only: Vegan, Vegetarian, Keto, Gluten-free, Budget, What’s in the cupboard

## Share page rules

- Path URLs only for new links: `/share/:slug` and `/share/list/:slug` (not `?share=` / `?list=`)
- JSON if `Accept` includes `application/json` (SPA). HTML otherwise (crawlers)
- Canonical and `og:url` always `https://www.myfoodsorted.com` + path — never Railway, never apex, never `x-forwarded-host`
- Same absolute OG image as homepage until per-recipe images exist
- SPA fetches with `Accept: application/json` from `SharedRecipeView.jsx`

## Canonical host

- `www` is canonical (sitemap and robots already use it)
- Apex `myfoodsorted.com` must **301** to `https://www.myfoodsorted.com` (path + query preserved)
- Implemented in the Cloudflare Worker, not a dashboard Redirect Rule (Wrangler token cannot write Redirect Rules)

## Intent pages (later, not unsolicited)

Only if the user asks for more SEO surface: `/how-it-works`, `/vs-meal-kits`, `/budget-dinners`, `/whats-in-the-cupboard`, a few diet pages, `/pricing`. Each is real HTML with a signup CTA. Do not invent a recipe blog.

## Verify

```bash
# Homepage tags + crawler copy
curl -sL https://www.myfoodsorted.com/ | rg -n "canonical|og:image|twitter:card|Personalised meal planning|Meal Planning, Budget"

# Apex 301
curl -sI https://myfoodsorted.com/ | rg -i "HTTP/|location:"

# Share HTML (not landing shell)
curl -sL https://www.myfoodsorted.com/share/list/tYQvlI4fBo7A | rg -n "Servings:|<section class=\"recipe\"|og:image|twitter:card"

# SPA still gets JSON
curl -sI -H "Accept: application/json" https://www.myfoodsorted.com/share/list/tYQvlI4fBo7A | rg -i content-type
```

Expect: apex `301` to www; www `/` is 200 with tags; share is recipe HTML + `x-share-proxy`; JSON accept is `application/json`.

## Output

Lead with what is true in production. Separate: already correct / change made / still manual. Do not recommend sitemapping all shares or Recipe schema unless the user explicitly wants that growth channel.
