# CollinMurch.com Agent Notes

## TL;DR

- **Stack:** Svelte 5 + SvelteKit (adapter-static) with mdsvex; Tailwind v4 + shadcn-svelte; Shiki (poimandres) for code blocks.
- **Events & styles:** Use native DOM event attributes (`onclick`, etc.) and Tailwind v4 classes—no inline `style` overrides for shadcn components.
- **Tooling:** Bun only. Static output lives in `build/` with cache rules under `static/_headers`.
- **Wave/hero:** All canvas + shader tweaks run through `src/components/WaveCanvas.svelte` and `$lib/webgl/*`.

## Project Layout

- `svelte.config.js` – mdsvex + Shiki configuration (custom highlighter tweaks); static adapter settings.
- `vite.config.js` – minimal Vite setup; rarely touched.
- `src/app.css` – global palette, typography, shared content styles.
- `src/routes/`
    - `+layout.svelte` – imports globals, manages navigation, transitions (`$lib/animations/transitions.js`), and wraps rendered pages.
    - `/about`, `/blog`, `/blog/[slug]` – page components; blog list loads posts via `+page.js`, slug page renders compiled mdsvex content.
    - Markdown posts live in `src/posts/*.md` and are automatically globbed by `src/lib/data/posts.js`.
- `src/components/` – navigation, socials, and the WebGL hero canvas that reacts to pointer input.
- `static/` – public assets (`images/`, `_headers` cache rules). Copied verbatim to the build output.

## Working With Markdown & Highlighting

- mdsvex handles `.md` files; add front‑matter (`title`, `date`, `description`, `excerpt`) for blog metadata.
- Syntax highlighting comes from Shiki’s poimandres theme; padding/border/rounding tweaks are injected in the custom highlighter inside `svelte.config.js`.

## Commands

- `bun install` – sync dependencies with `bun.lockb`.
- `bun run dev` – local dev server.
- `bun run build` – production build.
- `bun run preview` – serve the build locally.
- `bun run lint` – oxlint with `--max-warnings=0`; fails on any warning.
- `bun run format` – Prettier write.

## Tips & Gotchas

- Page transitions depend on route IDs; if you add routes, update `transitionMappings` in `$lib/animations/transitions.js`.
- Keep background / canvas tweaks inside `WaveCanvas` or the WebGL utilities; it’s tightly coupled to the layout.
- When adjusting caching or headers, edit `static/_headers` so deployment picks up the changes.
