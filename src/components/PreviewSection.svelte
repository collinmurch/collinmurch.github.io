<!--
	@component
	A section of the recipe listing. Past `PREVIEW_SIZE` items it shows only the
	first few, and its heading and an "All N" link lead to `href`, the page with
	the rest. Without `href` it shows every item.
-->
<script>
	import ChevronLink from "#components/ChevronLink.svelte";
	import { PREVIEW_SIZE } from "#lib/recipes/listing";

	const { id, label, items, href = null, list } = $props();

	const more = $derived(href !== null && items.length > PREVIEW_SIZE);
</script>

<section class="flex flex-col gap-6" aria-labelledby={id}>
	<h2 {id} class="m-0 text-heading">
		{#if more}
			<ChevronLink {href}>{label}</ChevronLink>
		{:else}
			{label}
		{/if}
	</h2>
	{@render list(more ? items.slice(0, PREVIEW_SIZE) : items)}
	{#if more}
		<ChevronLink {href} class="self-start text-prose text-muted-foreground">
			All {items.length}
			{label.toLowerCase()}
		</ChevronLink>
	{/if}
</section>
