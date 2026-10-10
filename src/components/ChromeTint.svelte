<!--
	@component
	Tints the iOS Safari 26 status bar and toolbar to continue the wave scene.

	Safari ignores `theme-color`. For each bar it probes a point just inside that edge of the
	viewport, walks up from the element it hits to the first fixed or sticky ancestor that
	spans the viewport width, and paints that element's `background-color` under the bar.
	Boxes 10px or thinner and those under 10% opacity are skipped, but the color is used at
	full strength regardless of the element's own opacity, so each strip here is a faint wash
	on screen while its bar gets a solid color.

	When an edge has no qualifying element, Safari keeps that edge's previous color until the
	next full page load, so both edges always carry a strip and client-side navigation can
	update them. The colors are the flat tones the shader settles to at each edge, kept in
	sync by `ocean.test.js`. Without the wave (reduced motion), the strips are hidden and both
	bars fall back to the page background.
-->
<script>
	const { submerged = false } = $props();

	const strip =
		"pointer-events-none fixed inset-x-0 z-50 h-3 opacity-15 motion-reduce:hidden";

	const colors = $derived(
		submerged
			? { top: "bg-water", bottom: "bg-depths" }
			: { top: "bg-sky", bottom: "bg-water" },
	);
</script>

<div aria-hidden="true" class={[strip, "top-0", colors.top]}></div>
<div aria-hidden="true" class={[strip, "bottom-0", colors.bottom]}></div>
