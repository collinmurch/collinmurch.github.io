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
- iOS Safari 26 ignores `theme-color` and colors its status bar and toolbar from fixed elements at the screen edges. A dedicated tint component keeps both bars matching the scene; its header comment explains Safari's rules. Any new full-width fixed element touching the top or bottom edge, such as a sticky header or a modal backdrop, competes with it and changes the bar color.
- The tint colors are the flat tones the shader settles to at the screen edges. A test derives them from the shader and fails if the CSS tokens drift, so change the scene's colors or depth shading and the tokens together.
- Keep the background cheap. It adapts its quality to the device's frame rate and stops entirely when the user prefers reduced motion.

## Blog

- Posts are Markdown files compiled by mdsvex. Each one needs `title`, `date`, and `description` front matter, and `excerpt` is optional.
- The blog listing must only import post metadata, never compiled post bodies, so the listing page stays small.
- Code blocks are highlighted at build time with Shiki, so they ship no highlighting JavaScript.

## Verifying visual changes

- Check layout changes at several sizes: small and large phones in both orientations, tablets in both orientations, a short laptop around 1280×720, and a large desktop. The short landscape cases break first.
- Check client-side navigation between pages, not just fresh page loads. The water level and browser-bar tints change on navigation, and those paths break independently of first load.
- Safari and Chromium differ on some intrinsic sizing, especially `aspect-ratio`. Prefer explicit sizes from tokens over sizes that depend on how the browser computes intrinsic dimensions.

## Deployment

GitHub Pages ignores `static/_headers`. Cache headers only take effect if a CDN or proxy in front of the site sets them.
