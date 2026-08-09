# collinmurch.com

Personal site and blog built with Svelte 5 and SvelteKit, prerendered for GitHub Pages.

## Stack

- Svelte 5 and SvelteKit with `adapter-static`
- Tailwind CSS v4
- mdsvex and Shiki using the poimandres theme
- WebGL 2 for the animated wave background
- Bun for dependencies, scripts, and tests

## Project structure

```text
src/
  components/          Application shell components
  lib/
    animations/        Route transition definitions
    data/              Blog metadata and article loaders
    markdown/          Shiki preprocessing and code-copy behavior
    seo/               Route metadata
    stores/            Shared wave state
    utils/             Class and date utilities
    webgl/             Shader sources and WebGL helpers
  posts/               Markdown articles
  routes/              SvelteKit pages and layouts
  app.css              Theme, typography, and shared content styles
static/                Images, icons, and host-specific header rules
```

Application-specific components live in `src/components`. shadcn-svelte primitives can be generated into `src/lib/components/ui` when needed; aliases are configured in `components.json`.

## Development

```sh
bun install
bun run dev
```

Quality commands:

```sh
bun run format
bun run lint
bun run test
bun run build
bun run budget
```

`format` checks formatting; use `bun run format:write` to update files. `budget` checks the existing production build, so run it after `build`.

## Blog authoring

Posts live in `src/posts/*.md` and require front matter:

```yaml
---
title: Example Post
date: "2024-11-16"
description: A description used for metadata.
excerpt: An optional shorter teaser.
---
```

The blog listing obtains metadata through `src/routes/blog/+page.server.js`. Article components are loaded separately through `src/lib/data/posts.js`, keeping article bodies out of the listing bundle.

Markdown preprocessing and Shiki configuration live in `src/lib/markdown/highlighter.js`. Code-block presentation lives in `src/app.css`, and copy-button behavior is mounted only on article routes through `src/lib/markdown/code-copy.js`.

## Deployment

`.github/workflows/main.yml` formats, lints, tests, builds, checks bundle budgets, and deploys the static `build/` directory to GitHub Pages.

`static/_headers` documents cache and security headers for hosts that support that file format. GitHub Pages does not apply it; equivalent rules for the production domain must be configured at the CDN or proxy.

## Runtime notes

- Route transitions are defined in `src/lib/animations/transitions.js`.
- The WebGL background is globally mounted from `src/components/WaveCanvas.svelte`.
- Canvas and shader changes belong in `WaveCanvas.svelte` or `src/lib/webgl`.
- Responsive portraits use 256, 384, and 500 pixel AVIF/WebP sources in `static/images`.
