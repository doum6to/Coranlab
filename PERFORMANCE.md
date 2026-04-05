# Performance Optimizations

This file documents the performance optimizations applied to Quranlab and
the manual steps you (the operator) still need to take.

## Automated (already applied in code)

1. **loading.tsx skeletons** on all main routes (`/learn`, `/lecons`,
   `/leaderboard`, `/quests`, `/courses`, `/lesson`, list pages) — the
   layout streams instantly, then data loads.
2. **unstable_cache + tags** on `getCourses`, `getCourseById`,
   `getTopTenUsers` (revalidated via `revalidateTag("leaderboard")` from
   mutation actions).
3. **Static pages**: `/` (marketing) + `/auth/login` + `/auth/signup`
   are `force-static` — served from the CDN with zero server time.
4. **Image optimization**: AVIF > WebP, long TTL, modular lucide imports
   via `modularizeImports`, `sizes` attribute on hot illustrations,
   `priority` on the hero image, long-term immutable cache headers on
   static assets.
5. **Promise.all parallelization** across `/learn`, `/lecons`,
   `/leaderboard`, main layout and `getListsWithLevels`.
7. **Column-narrowed Drizzle queries** in the hot path
   (`getListsWithLevels`, `getUnits`, `getCourseProgress`,
   `getUnlockedLessons`) — only the fields actually read are fetched.
8. **Dynamic imports** for `ExitModal` and `HeartsModal` via a
   `ModalsProvider` client component → removed from the initial JS.
9. **Prefetch + router.push** for the end-of-lesson "Continuer" flow:
   the return page is warm before the user clicks.
10. **Bundle analyzer** wired up — run `npm run analyze` to inspect the
    production client bundle.
12. **Edge runtime** enabled on the `/` marketing route (no DB access).

## Manual steps required

### 6. Run the DB indexes migration

Open the Supabase SQL editor and paste the contents of
[`db/indexes.sql`](./db/indexes.sql). It's safe to run multiple times
(`IF NOT EXISTS`). Expect an immediate speedup on leaderboard, learn
page and streak queries.

### 13. (Optional) Add Upstash Redis for shared cache

Currently `unstable_cache` is local to each Vercel serverless container.
To share the cache across instances:

1. Create a free Upstash Redis database at
   https://console.upstash.com/redis
2. Add these env vars on Vercel and `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```
3. Install the client: `npm install @upstash/redis`
4. The helper in `lib/cache.ts` (see below) will automatically pick it
   up when the env vars are set.

### 14. PWA / Service Worker

Installing `next-pwa` requires a config rewrite that's safer done in an
isolated PR. Steps:

1. `npm install next-pwa`
2. Wrap `next.config.mjs` with `withPWA({ dest: "public" })`.
3. Add a `public/manifest.json` and icons.

Skipped for now — do this once the core optimizations are verified.

### 15. Region alignment (Supabase ↔ Vercel)

1. Check Supabase project region:
   https://supabase.com/dashboard/project/_/settings/general
2. Check Vercel project region:
   https://vercel.com/dashboard → Project → Settings → Functions.
3. If they don't match, either redeploy Vercel to the same region (e.g.
   `cdg1` for Paris, `iad1` for Virginia) or recreate the Supabase
   project in the matching region. Every mismatched region round-trip
   adds ~100 ms per DB query.

### 11. Next 15 + PPR migration (deferred)

Partial Prerendering (PPR) becomes stable in Next 15, which requires
React 19 and async request APIs (`cookies()`, `headers()` become
async). This is a medium-sized migration:

- Bump `next` to `^15`, `react` to `^19`, `react-dom` to `^19`.
- Audit every call site of `cookies()` / `headers()` / `params`.
- Update `@supabase/ssr` to a version that supports async cookies.
- Add `export const experimental_ppr = true` to layouts.

Plan this as a separate PR once the current optimizations are verified
in production.
