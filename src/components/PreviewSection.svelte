<!--
	@component
	A section of the recipe listing. Past `limit` items it shows only the first
	few, and its heading and an "All N" link lead to `href`, the page with the
	rest. Without `href` it shows every item.

	`list` receives the items to show and, when there are more, the "All N" link
	as `{ href, text }`. With `inline`, the list renders that link itself, such
	as a carousel's last card; otherwise it sits below the list.
-->
<script>
	import ChevronLink from "#components/ChevronLink.svelte";

	const { id, label, items, href = null, limit, inline = false, list } = $props();

	const all = $derived(
		href !== null && items.length > limit
			? { href, text: `All ${items.length} ${label.toLowerCase()}` }
			: null,
	);
</script>

<section class="flex flex-col gap-6" aria-labelledby={id}>
	<h2 {id} class="m-0 text-heading">
		{#if all}
			<ChevronLink {href}>{label}</ChevronLink>
		{:else}
			{label}
		{/if}
	</h2>
	{@render list(all ? items.slice(0, limit) : items, all)}
	{#if all && !inline}
		<ChevronLink {href} class="self-start text-prose text-muted-foreground">
			{all.text}
		</ChevronLink>
	{/if}
</section>
