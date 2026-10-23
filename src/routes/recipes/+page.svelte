<script>
	import Icon from "#components/Icon.svelte";
	import RecipeCards from "#components/RecipeCards.svelte";
	import { planTitle } from "#lib/recipes/format";
	import { byCourse, matchesSearch } from "#lib/recipes/listing";

	const { data } = $props();

	let query = $state("");
	const shown = $derived(data.recipes.filter((recipe) => matchesSearch(recipe, query)));
	const courses = $derived(byCourse(shown));
</script>

<svelte:head>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="Recipes"
		href="/recipes/feed.xml"
	/>
</svelte:head>

<div class="mx-auto max-w-measure space-y-14">
	<div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
		<h1>Recipes</h1>

		{#if data.recipes.length > 0}
			<label
				class="flex w-[min(100%,20rem)] items-center gap-2.5 rounded-full border border-accent/20 bg-card/60 px-4 py-2 text-muted-foreground transition-colors duration-150 focus-within:border-accent/50 hover:border-accent/35"
			>
				<Icon name="search" class="size-4" />
				<span class="sr-only">Search recipes</span>
				<input
					type="search"
					bind:value={query}
					placeholder="Dish, ingredient, cuisine"
					class="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground/70"
				/>
			</label>
		{/if}
	</div>

	<p class="sr-only" aria-live="polite">
		{query.trim() ? `${shown.length} ${shown.length === 1 ? "recipe" : "recipes"}` : ""}
	</p>

	{#each courses as { course, label, recipes } (course)}
		<section class="flex flex-col gap-6" aria-labelledby={`course-${course}`}>
			<h2 id={`course-${course}`} class="m-0 text-2xl">{label}</h2>
			<RecipeCards {recipes} />
		</section>
	{:else}
		<p class="text-prose text-muted-foreground">
			{data.recipes.length === 0
				? "Nothing in the kitchen yet."
				: "No recipes match that search."}
		</p>
	{/each}

	{#if data.plans.length > 0}
		<section class="flex flex-col gap-6">
			<h2 class="m-0 text-2xl">Plans</h2>
			<ul class="space-y-2 text-prose">
				{#each data.plans as plan (plan.id)}
					<li>
						<a class="capitalize" href={`/recipes/plans/${plan.id}`}
							>{planTitle(plan)}</a
						>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>
