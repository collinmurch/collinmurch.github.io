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

- Posts are Markdown files compiled by mdsvex. Each one needs `title`, `date`, and `description` front matter, and `excerpt` is optional.
- The blog listing must only import post metadata, never compiled post bodies, so the listing page stays small.
- Code blocks are highlighted at build time with Shiki, so they ship no highlighting JavaScript.
- Mermaid fences are rendered to SVG at build time with beautiful-mermaid, so pages ship no diagram JavaScript. It supports flowchart, state, sequence, class, ER, and XY chart diagrams, and a diagram it can't parse fails the build. Its output is post-processed in `src/lib/markdown/mermaid.js` and `svg.js`, so the version is pinned. Bump it deliberately and rerun the tests.
- Diagram colors are site tokens passed as CSS variables, so diagrams follow `app.css` without a rebuild. Never hardcode colors there.
- Inline SVGs share a page with each other, so their ids are prefixed and their `<style>` blocks are wrapped in `@scope`. Keep any new inline SVG path going through `prepareSvg`.
- Post images live in a folder named after the post and are referenced relatively. Raster images are imported through Vite with their intrinsic size. An SVG on its own line is inlined so it can use `currentColor` and the color tokens.
- Diagrams sit in a native scroll viewport, so touch, trackpad, and keyboard scrolling come from the browser. `diagram-controls.js` adds mouse drag panning, ctrl+wheel and Safari gesture zoom around the cursor, zoom and recenter buttons, and a toggle to the diagram's Shiki-highlighted source, which is rendered at build time beside the SVG. A plain wheel is never captured. The script builds the toolbar itself, so prerendered pages carry only the diagram and its source, and pinch zoom is applied at most once per frame.
- Buttons that float over code blocks and diagrams share the `.block-btn` style and the top-right, reveal-on-hover placement. Reuse them for any new block control so they all feel the same, and put related buttons in a `.block-btn-group`, which joins them into one segmented button.
- Code blocks and diagrams share the `--color-panel` background. Shiki's own background is stripped so that token stays the single source.
- Figures scale with the reading text: 1px of drawing is 1/16em. Diagrams can break out of the text column up to the article container, which is why the blog layout is an `@container`.

## Verifying visual changes

- Check layout changes at several sizes: small and large phones in both orientations, tablets in both orientations, a short laptop around 1280×720, and a large desktop. The short landscape cases break first.
- Check client-side navigation between pages, not just fresh page loads. The water level and browser-bar tints change on navigation, and those paths break independently of first load.
- Safari and Chromium differ on some intrinsic sizing, especially `aspect-ratio`. Prefer explicit sizes from tokens over sizes that depend on how the browser computes intrinsic dimensions.

## Deployment

GitHub Pages ignores `static/_headers`. Cache headers only take effect if a CDN or proxy in front of the site sets them.
