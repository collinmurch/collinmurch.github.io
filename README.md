# collinmurch.com

My personal site and blog, built with SvelteKit and prerendered to static HTML for GitHub Pages.

## Getting started

Install [Bun](https://bun.sh), then:

```sh
bun install
bun run dev
```

Before pushing, run the same checks as CI:

```sh
bun run lint
bun run format
bun run test
```

`bun run format:write` fixes formatting.

## Writing a post

Add a Markdown file to `src/posts/`:

```yaml
---
title: Example Post
date: "2024-11-16"
description: Used for metadata and the blog listing.
excerpt: Optional shorter teaser.
---
```

Fenced `mermaid` blocks render as diagrams. Put images in a folder named after the post and reference them relatively, such as `![Alt text](./example-post/chart.svg "Optional caption")`. An SVG on its own line is inlined, so it can draw with `currentColor` and the color tokens in `app.css`.

Pushing to `main` deploys the site.
