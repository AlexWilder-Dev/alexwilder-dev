# AlexWilder-Dev — studio site

Single-page studio site for Alex Wilder. Concept: **non-photo blue underlay,
inked over** — the page sketches itself in construction blue, then the ink
pass resolves it, mirroring the demo-first business model.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to ./out
```

Deploys to GitHub Pages automatically on push to `main`
(`.github/workflows/deploy.yml`); the workflow injects the repo basePath.
Also deploys to Vercel with zero config.

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · GSAP + ScrollTrigger ·
Lenis · canvas 2D hero (no WebGL).

## Dropping in real content

- Plate screenshots live in `assets/images/` (WebP, ~2:1) and are wired up in
  `components/Plates.tsx`.
- Portrait: `components/About.tsx` — `TODO: replace with real portrait`, 4:5.

Every animation has a `prefers-reduced-motion` fallback that renders the
final state; the hero sequence is skippable with any tap/key/scroll.
