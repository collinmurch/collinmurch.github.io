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

Pushing to `main` deploys the site.
