# CollinMurch.com Agent Notes

## TL;DR

- **Stack:** Svelte 5 + SvelteKit with `adapter-static`; mdsvex and Shiki; Tailwind CSS v4.
- **Events and styles:** Use native DOM event attributes and Tailwind v4 classes. Do not add inline style overrides to generated shadcn components.
- **Tooling:** Use Bun only. Static output lives in `build/`.
- **Wave background:** Keep canvas and shader changes in `src/components/WaveCanvas.svelte` and `src/lib/webgl`.

## Project layout

- `svelte.config.js` contains SvelteKit, adapter, and Markdown preprocessor configuration.
- `vite.config.js` contains Tailwind, SvelteKit, and the application-component alias.
- `src/app.css` owns the palette, typography, content styling, and code-block presentation.
- `src/components` contains application shell components: navigation, socials, and the wave canvas.
- `src/lib/markdown` contains Shiki preprocessing and article code-copy behavior.
- `src/lib/data` separates server-only blog metadata from dynamically loaded article modules.
- `src/lib/utils` separates class composition from date handling.
- `src/routes/blog/+page.server.js` supplies the blog listing metadata.
- `src/routes/blog/[slug]` loads and renders compiled mdsvex articles.
- `src/posts/*.md` contains Markdown posts.
- `static/images` contains responsive image sources and social icons.
- `static/_headers` applies only on hosts that support `_headers`; GitHub Pages does not.

## Markdown and highlighting

- Posts require `title`, `date`, and `description` front matter; `excerpt` is optional.
- `src/lib/markdown/highlighter.js` configures Shiki with the poimandres theme.
- `src/app.css` controls code-block spacing, borders, scrolling, and copy-button presentation.
- `src/lib/markdown/code-copy.js` is mounted only by article routes.

## Commands

- `bun install` installs dependencies from `bun.lockb`.
- `bun run dev` starts the development server.
- `bun run build` creates the static production build.
- `bun run preview` serves the existing production build.
- `bun run lint` runs oxlint with zero warnings allowed.
- `bun run format` checks formatting; `bun run format:write` updates it.
- `bun run test` runs the Bun test suite.
- `bun run budget` checks bundle sizes after a production build.

## Tips and gotchas

- Update `transitionMappings` in `src/lib/animations/transitions.js` when route-transition behavior changes.
- Keep blog metadata server-only so the listing does not import compiled article bodies.
- Run build before bundle budgets.
- Configure production cache headers at the CDN or proxy because GitHub Pages ignores `static/_headers`.
