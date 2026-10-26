# Working on collinmurch.com

A personal site and blog. It is fully prerendered and deployed to GitHub Pages, so every page must be buildable as static HTML. Nothing runs on a server at request time.

## Svelte 5 only

Write current Svelte 5 code, even if older patterns would still compile:

- Use runes for state and props: `$props()`, `$state()`, `$derived()`, and `$effect()`. Do not use `export let` or `$:`.
- Use plain event attributes such as `onclick={...}`, not `on:click`. Use callback props instead of `createEventDispatcher`.
- Use snippets and `{@render children()}` instead of `<slot>`.
- Use `$app/state`, not `$app/stores`.

## Tooling

- Use Bun for everything: installs, scripts, and tests. Do not use npm or yarn.
- Before you finish, run `bun run lint`, `bun run format`, and `bun run test`, the same checks CI runs. Linting allows zero warnings.
- Bundle budgets read the production build, so run `bun run build` before `bun run budget`.

## Styling

- Use Tailwind v4 classes in markup. Shared tokens and prose styles live in `app.css`.
- Do not use width breakpoints or per-device overrides to size things. Sizes come from a few fluid CSS tokens, and the only layout switch is portrait versus landscape orientation. If something looks wrong on one device, fix the token or the derivation, not that device.
- The home page sits over the wave background, and its content must never overlap the water at any viewport size. The `--waterline` token describes where the highest wave crest reaches. If you change the water level or swell height in the shader, update `--waterline` to match.
- The hero photo is the unit of scale for the hero. The name, tagline, spacing, and shadow are proportions of it. The home and about pages share the same hero, so their photos are always the same size.
- Reading text and code scale fluidly with the viewport. Keep them comfortable on both phones and large monitors, and don't fix code at a small pixel size.

## The wave background

- The ocean is a WebGL fragment shader. Some of its constants and its wave function are mirrored in JavaScript so pointer interaction can follow the drawn surface. A test fails if the two drift apart, so change both together.
- The water rises to cover the screen on every page except home, so new pages are underwater by default. The root layout decides this in one place and passes it to both the wave and the browser-bar tint.
- The tint colors are the flat tones the shader settles to at the screen edges. A test derives them from the shader and fails if the CSS tokens drift, so change the scene's colors or depth shading and the tokens together.
- Keep the background cheap. It adapts its quality to the device's frame rate and stops entirely when the user prefers reduced motion.

## iPhone and iOS Safari gotchas

- Safari 26 ignores `theme-color`. It colors the status bar and toolbar from the first full-width fixed or sticky element at each screen edge, using that element's background at full strength even when the element is nearly transparent. `ChromeTint.svelte` keeps a faint strip at each edge for this, and its header comment lists Safari's exact rules. Any new full-width fixed element touching the top or bottom edge, such as a sticky header or a modal backdrop, competes with those strips and changes the bar color.
- If neither edge has a qualifying element, Safari keeps the previous bar color until the next full page load. Keep both strips mounted at all times and change only their color, or the bars stop updating on client-side navigation.
- The toolbar collapses and expands while the user scrolls, which resizes the viewport in the middle of a scroll. The canvas is `h-dvh`, so it resizes too. Resizing a WebGL drawing buffer clears it to black, so the renderer redraws in the same callback that resizes it. Don't wait for the paced render loop: underwater it runs at 20fps, and the cleared buffer would flash black for several frames.
- Size layout with `svh` tokens, not `dvh`, so content doesn't jump when the toolbar collapses. Only the fixed background uses `dvh`, so it always fills the visible screen.
- The viewport uses `viewport-fit=cover`, so content can sit under the notch, the Dynamic Island, and the home indicator. Pad any fixed or edge-hugging UI with `env(safe-area-inset-*)`.
- Simulators and desktop responsive modes don't reproduce toolbar collapse or bar tinting. Check those on a real iPhone. For glitches that only last a frame or two, take a screen recording, find dark or odd frames with `ffmpeg` (for example, `signalstats` average brightness), and extract those frames to inspect them.

## Blog

- Each post is a folder in `posts/` holding its Markdown and assets. The folder name is the slug, and the post is the first of `<folder>.md`, `README.md`, or `index.md`. A folder with Markdown but none of those fails the build. `post-paths.js` resolves this for both the listing and the post route.
- Posts are compiled by mdsvex. Each one needs `title`, `date` (`MM-DD-YYYY`), and `description` front matter, and `assertFrontMatter` fails the build when one is missing or the date doesn't parse, so pages never need placeholders. `description` is the only summary, used for the page meta tags.
- The post page renders `title` as its only `<h1>`, so a post's own headings start at `##`. Don't use `#` in a post, and don't shift headings up because the raw Markdown seems to start a level too deep.
- The blog listing must only import post metadata, never compiled post bodies, so the listing page stays small.
- Code blocks are highlighted at build time with Shiki, so they ship no highlighting JavaScript.
- Mermaid fences are rendered to SVG at build time with beautiful-mermaid, so pages ship no diagram JavaScript. It supports flowchart, state, sequence, class, ER, and XY chart diagrams, and a diagram it can't parse fails the build. Its output is post-processed in `src/lib/markdown/mermaid.js` and `svg.js`, so the version is pinned. Bump it deliberately and rerun the tests.
- beautiful-mermaid rejects Mermaid's YAML front matter, so `mermaid.js` strips it first. `title` becomes the figure caption, and `config.look: handDrawn` (with optional `config.handDrawnSeed`) redraws the shapes with rough.js at build time in `sketch.js`. Theme and font settings are ignored, because diagrams always use the site's tokens and font.
- Diagram colors are site tokens passed as CSS variables, so diagrams follow `app.css` without a rebuild. Never hardcode colors there.
- Inline SVGs share a page with each other, so their ids are prefixed and their `<style>` blocks are wrapped in `@scope`. Keep any new inline SVG path going through `prepareSvg`.
- Post images live in the post's folder and are referenced relatively. Raster images are imported through Vite with their intrinsic size. An SVG on its own line is inlined so it can use `currentColor` and the color tokens.
- Fenced code and headings compile to Svelte components. `highlight.js` wraps code in `CodeBlock` and renders Mermaid as a `Diagram`, and `headings.js` gives every heading a GitHub-style id and a `HeadingLink` that copies a link to it. Each remark plugin imports the components it emits through `injectImports` in `mdast.js`. Their buttons are prerendered with the page like any other component.
- Diagrams sit in a native scroll viewport, so touch, trackpad, and keyboard scrolling come from the browser. `Diagram.svelte` has zoom and recenter buttons and a toggle to the diagram's Shiki-highlighted source, which it shows as an ordinary `CodeBlock` so source views always match other code. Don't style a diagram's source separately. `diagram-controls.js` adds mouse drag panning and ctrl+wheel and Safari gesture zoom around the cursor. A plain wheel is never captured, and pinch zoom is applied at most once per frame.

## Recipes

- Recipes live in the public [recipes repo](https://github.com/collinmurch/recipes) as Cooklang files. Its CI builds a bundle (`index.json` and `jsonld/<slug>.json`), and the bundle is the whole contract. The site never parses Cooklang and never re-derives anything the bundle provides, such as ingredient lines, step text, or grocery totals. If the site needs something new, add it to the bundle in the recipes repo.
- `src/lib/recipes/data.server.js` is the only code that reads the bundle. It fails the build on any `schema` but 1, so a format change can't ship half-rendered. New fields can appear without a schema change, so read only what you use.
- `recipes-data/` holds the bundle, and the recipes repo's CI owns it. After every passing push to its `main`, that CI replaces the folder and commits it here with a deploy key, and that push deploys the site. Never edit the folder by hand, since the next publish overwrites it. Expect bot commits on `main`, so pull before pushing. Every commit holds the bundle it renders, so any commit builds and deploys the same way, and a missing bundle fails the build.
- Recipe pages scale servings in the browser from each ingredient's `amounts` and the bundle's `units` table, which says how each unit pluralizes and whether it reads as a decimal. `amounts.js` mirrors the recipes repo's number formatting, and a test fails unless every amount in the bundle reads exactly as the bundle writes it, so change the two together.
- To preview unpublished recipes, run `python3 scripts/recipes.py build` in the recipes repo and point `RECIPES_DIR` at its `dist`.
- A bundle with an unknown `schema` fails the build of the commit that brought it, so the live site stays on the last good deploy. Teach the site the new schema before the recipes repo publishes it.
- The listing gets summaries only, like the blog listing, and searches them on the client. Each recipe page embeds the bundle's JSON-LD with `url` added, which is what lets Safari's share sheet save it to Mela.

## Buttons

- Every icon button is `Button.svelte`. Don't hand-roll buttons or copy its classes. `framed` is the rectangle that floats over code and diagrams; `quiet` is the soft circle for controls in a page's chrome, like the share links beside a post title. Pass `href` for a link.
- Join related buttons in a `ButtonGroup`. Framed buttons become one segmented control and quiet ones sit side by side, and buttons inside take the group's variant.
- Anything that copies uses `CopyButton`, which confirms with the icon-to-check swap. That swap is the site's one confirmation animation, driven by `Button`'s `status`.
- Icons live in `Icon.svelte` as stroke paths on a 24-unit grid. Add new ones there.
- Controls over a code block or diagram go in `BlockControls`, which pins them to the top right and reveals them on hover or focus.
- Code blocks fit 80 columns of code (`80ch` in the code's own font) and break out of the text column up to the article container when there's room, the same way diagrams do. Size them through that rule, not per block.
- Code blocks and diagrams share the `--color-panel` background. Shiki's own background is stripped so that token stays the single source.
- Figures scale with the reading text: 1px of drawing is 1/16em. Diagrams can break out of the text column up to the article container, which is why the blog layout is an `@container`.

## Verifying visual changes

- Check layout changes at several sizes: small and large phones in both orientations, tablets in both orientations, a short laptop around 1280×720, and a large desktop. The short landscape cases break first.
- Check client-side navigation between pages, not just fresh page loads. The water level and browser-bar tints change on navigation, and those paths break independently of first load.
- Safari and Chromium differ on some intrinsic sizing, especially `aspect-ratio`. Prefer explicit sizes from tokens over sizes that depend on how the browser computes intrinsic dimensions.

## Deployment

GitHub Pages ignores `static/_headers`. Cache headers only take effect if a CDN or proxy in front of the site sets them.
