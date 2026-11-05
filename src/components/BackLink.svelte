<!--
	@component
	The link back up from a page to where it was reached from, set above the
	page's title. It owns the gap below it, so every page spaces it the same way.
	That margin beats a parent's `space-y`, whose margins have zero specificity.
-->
<script>
	import ChevronLink from "#components/ChevronLink.svelte";

	const { href, children } = $props();
</script>

<ChevronLink {href} back class="mb-4 block w-fit text-prose text-muted-foreground">
	{@render children()}
</ChevronLink>
