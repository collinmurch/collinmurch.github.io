# CollinMurch.com Agent Notes

## TL;DR
- **Stack:** Svelte 5 + SvelteKit (adapter-static) with mdsvex; Tailwind v4 + shadcn-svelte; syntax highlighting handled by Shiki using the bundled poimandres theme.
- **Svelte 5:** Prefer native DOM event attributes (e.g. `onclick={() => ...}`) instead of legacy `on:click` directives.
- **Tailwind v4:** Always use the v4 pipeline and keep shadcn’s defaults (no `style` key) so the CLI stays on the supported track.
- **Tooling:** Use `bun` for everything (`bun install`, `bun run dev|build|preview`). Avoid npm/yarn.
- **Output:** Static site; production artifacts land in `build/` (plus `static/_headers` for cache rules).
- **Deployment:** Built assets are pushed through the existing GitLab workflow (see project CI/CD) to publish the static bundle.

## Project Layout
- `svelte.config.js` – mdsvex + Shiki configuration (custom highlighter tweaks, no Prism remnants); static adapter settings.
- `vite.config.js` – minimal Vite setup; rarely touched.
- `src/app.css` – global palette, typography, shared content styles.
- `src/routes/`
  - `+layout.svelte` – imports globals, manages navigation, transitions (`$lib/animations/transitions.js`), and wraps rendered pages.
  - `/about`, `/blog`, `/blog/[slug]` – page components; blog list loads posts via `+page.js`, slug page renders compiled mdsvex content.
  - Markdown posts live in `src/posts/*.md` and are automatically globbed by `src/lib/data/posts.js`.
- `src/components/` – navigation, socials, and `WaveCanvas.svelte` (WebGL hero background driven by shaders in `src/lib/webgl/`).
- `static/` – public assets (`images/`, `_headers` cache rules). Copied verbatim to the build output.

## Working With Markdown & Highlighting
- mdsvex handles `.md` files; add front‑matter (`title`, `date`, `description`, `excerpt`) for blog metadata.
- Syntax highlighting comes from Shiki’s poimandres theme; padding/border/rounding tweaks are injected in the custom highlighter inside `svelte.config.js`.
- No PrismJS remains—avoid reintroducing the old stylesheet.

## Commands
- `bun install` – ensure dependencies are in sync with `bun.lockb`.
- `bun run dev` – local server.
- `bun run build` – production build (generates static bundle under `build/` and `.svelte-kit/` output).
- `bun run preview` – serve the production build locally (mirrors deployment).

## Tips & Gotchas
- Page transitions depend on route IDs; if you add routes, update `transitionMappings` in `$lib/animations/transitions.js`.
- Keep background / canvas tweaks inside `WaveCanvas` or the WebGL utilities; it’s tightly coupled to the layout.
- When adjusting caching or headers, edit `static/_headers` so deployment picks up the changes.
