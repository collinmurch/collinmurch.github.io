<!--
	@component
	A link for finding your way around, such as to a course's page or back to the
	recipes. Its chevron marks it as a link, so it skips the text-link underline,
	and the chevron nudges the way it leads on hover. `back` points it backward.

	The chevron sits inline with `vertical-align: middle`, which centers it on the
	lowercase letters rather than on the whole line box, so it reads as level. It
	needs `inline-block`, because Tailwind's base styles make every SVG a block.
-->
<script>
	import Icon from "#components/Icon.svelte";

	const { href, back = false, class: className, children } = $props();
</script>

{#snippet chevron()}
	<Icon
		name="chevron"
		class={[
			"inline-block size-[0.7em] align-middle text-muted-foreground transition-transform duration-150 group-hover:text-accent motion-reduce:transition-none",
			back
				? "me-[0.3em] rotate-180 group-hover:-translate-x-[0.15em]"
				: "ms-[0.3em] group-hover:translate-x-[0.15em]",
		]}
	/>
{/snippet}

<a
	{href}
	data-chevron-link
	class={[
		"group transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
		className,
	]}
>
	{#if back}{@render chevron()}{/if}{@render children()}{#if !back}{@render chevron()}{/if}
</a>
