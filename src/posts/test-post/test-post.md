---
title: Test Post
date: "2024-11-16"
description: A quick markdown sample post for validating mdsvex rendering on the static site.
excerpt: A tiny sample article used to ensure the blog pipeline works end to end.
---

This is a post to test markdown rendering with static sites.
Here's some **bold** text and some _italic_ text.

This is a new paragraph with a link to [svelte.dev](https://svelte.dev).

This paragraph is long enough to push the code block just beyond the screen limit of an iPhone.

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

## Diagrams

Mermaid fences are rendered to SVG at build time, so the page ships no diagram code. This one traces how a post becomes a page.

```mermaid
flowchart TB
  accTitle: How a post is built
  accDescr: A Markdown post passes through mdsvex, Shiki, and the diagram renderer before SvelteKit prerenders it to static HTML.

  Author((Author)) -->|writes| MD[/post.md/]

  subgraph Build [Build time]
    direction TB
    MD --> Mdsvex[mdsvex]
    Mdsvex --> Fence{Fenced block?}
    Fence -->|code| Shiki[Shiki highlighter]
    Fence -->|mermaid| Diagram[Diagram renderer]
    Mdsvex --> Images{Local image?}
    Images -->|svg| Inline[Inline SVG figure]
    Images -->|raster| Asset[(Fingerprinted asset)]
    Shiki --> Component[Svelte component]
    Diagram --> Component
    Inline --> Component
    Asset -.->|import| Component
  end

  subgraph Ship [Deploy]
    Component ==> Prerender[[Prerender]]
    Prerender --> HTML[(Static HTML)]
    HTML --> Pages>GitHub Pages]
  end

  Pages -->|serves| Reader((Reader))

  classDef endpoint fill:#ad6600,stroke:#fff7ec,color:#fff7ec
  class Author,Reader endpoint
```

Sequence diagrams work too, and their markers stay separate from the diagram above.

```mermaid
sequenceDiagram
  autonumber
  participant R as Reader
  participant P as GitHub Pages
  participant B as Browser
  R->>+P: GET /blog/test-post
  P-->>-R: Prerendered HTML
  R->>B: Paint diagrams and text
  alt Client navigation
    B->>+P: Fetch route chunk
    P-->>-B: JavaScript
    Note over B,P: No diagram runtime is downloaded
  else Full page load
    B->>B: Hydrate
  end
```

## Images

An SVG next to the post is inlined, so it can draw with `currentColor` and the site's color tokens.

![A tide curve between a high tide in the morning and a low tide in the afternoon](./tides.svg "Tides drawn with the site's accent and primary colors.")
