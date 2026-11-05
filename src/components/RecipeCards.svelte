<script>
	import ChevronLink from "#components/ChevronLink.svelte";
	import { formatMinutes, humanize } from "#lib/recipes/format";

	/**
	 * Recipe summaries as cards that link to each recipe: a grid, or with
	 * `carousel` a row that scrolls sideways. `all` (`{ href, text }`) ends the
	 * carousel with a card leading to the rest.
	 *
	 * The carousel bleeds 1rem past the text column, the narrowest page padding,
	 * and pads itself back so the cards line up with the heading. The extra
	 * block padding keeps the card shadows from being clipped by the scroller.
	 */
	const { recipes, carousel = false, all = null } = $props();
</script>

<ul
	class={[
		"grid gap-4",
		carousel
			? "-mx-4 -mt-2 -mb-8 snap-x snap-mandatory auto-cols-[min(17rem,82%)] grid-flow-col overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pt-2 pb-8 [scrollbar-width:thin]"
			: "grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))]",
	]}
>
	{#each recipes as recipe (recipe.slug)}
		<li class="flex snap-start">
			<a
				href={`/recipes/${recipe.slug}`}
				data-card
				class="group surface flex w-full flex-col gap-2 px-5 py-4 text-foreground transition-colors duration-150 hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
			>
				<h3
					class="m-0 text-xl leading-snug text-accent transition-colors duration-150 group-hover:text-primary"
				>
					{recipe.title}
				</h3>
				{#if recipe.description}
					<span class="line-clamp-2 text-muted-foreground">{recipe.description}</span>
				{/if}
				<span
					class="mt-auto flex justify-between gap-4 pt-1 text-sm text-muted-foreground"
				>
					<span class="capitalize"
						>{recipe.cuisine ? humanize(recipe.cuisine) : ""}</span
					>
					{#if recipe.time}
						<span class="whitespace-nowrap">{formatMinutes(recipe.time)}</span>
					{/if}
				</span>
			</a>
		</li>
	{/each}
	{#if all}
		<li class="flex snap-start">
			<ChevronLink
				href={all.href}
				class="flex w-full items-center justify-center rounded-2xl border border-dashed border-accent/25 px-5 py-4 text-center text-xl text-muted-foreground hover:border-accent/50"
			>
				{all.text}
			</ChevronLink>
		</li>
	{/if}
</ul>
