# collinmurch.com

Personal site & blog built with SvelteKit and deployed to GitHub Pages.

## Stack & Tooling

- **Framework:** Svelte 5 + SvelteKit with the static adapter (pre-rendered output).
- **Styling:** Tailwind CSS v4 + shadcn-svelte primitives; global tokens live in `src/app.css`.
- **Markdown:** mdsvex + Shiki (poimandres theme) for syntax highlighting; padding/border tweaks happen in `svelte.config.js`.
- **Runtime:** Bun (see `bun.lockb`); all scripts reference Bun’s `vite` binary.
- **Effects:** `WaveCanvas` drives the background WebGL hero – keep shader/wave tweaks inside `src/components/WaveCanvas.svelte` and `$lib/webgl/*`.

## Development

1. Install deps: `bun install`
2. Start dev server: `bun run dev`
3. Production build: `bun run build` (runs `svelte-kit sync` automatically, outputs to `build/`)
4. Preview build output locally: `bun run preview`

### Quality gates

- Lint JavaScript/Svelte: `bun run lint` (oxlint, `--max-warnings=0`)
- Auto-fix lint issues: `bun run lint:fix`
- Format: `bun run format:write`

## Content authoring

- Markdown lives in `src/posts/*.md`. Each post **must** define front matter:
    ```yaml
    ---
    title: Example Post
    date: "2024-11-16"
    description: Optional long description for SEO.
    excerpt: Optional shorter teaser used in meta tags.
    ---
    ```
- Posts are globbed through `src/lib/data/posts.js`; the fetch helpers now skip caching in dev so edits show up without restarting.
- Route transitions are defined in `$lib/animations/transitions.js`; add new route IDs there if you introduce additional top-level pages.

## Deployment

- GitHub Actions workflow (`.github/workflows/main.yml`) builds on pushes/PRs and deploys to GitHub Pages.
- Static artifacts land in `build/`; cache headers are managed via `static/_headers`.
- Keep image assets in `static/images/` so they’re copied verbatim during `bun run build`.

## Misc tips

- Navigation + hero animations rely on route IDs. If you add routes, update `transitionMappings` and the nav link list before shipping.
- `WaveCanvas` is globally mounted; avoid moving it out of the root layout so the pointer listeners and reduced-motion handling keep working.
