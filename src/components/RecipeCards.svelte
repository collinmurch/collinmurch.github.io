<script>
	import { formatMinutes, humanize } from "#lib/recipes/format";

	/** Recipe summaries as a grid of cards that link to each recipe. */
	const { recipes } = $props();
</script>

<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-4">
	{#each recipes as recipe (recipe.slug)}
		<li class="flex">
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
</ul>
