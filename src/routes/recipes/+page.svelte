<script>
	import ChevronLink from "#components/ChevronLink.svelte";
	import RecipeCards from "#components/RecipeCards.svelte";
	import RecipeSearch from "#components/RecipeSearch.svelte";
	import { planTitle } from "#lib/recipes/format";
	import { byCourse, matchesSearch, PREVIEW_SIZE } from "#lib/recipes/listing";

	const { data } = $props();

	let query = $state("");
	const shown = $derived(data.recipes.filter((recipe) => matchesSearch(recipe, query)));
	const courses = $derived(byCourse(shown));
	const searching = $derived(query.trim() !== "");
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
	<div class="grid grid-cols-[auto_1fr] items-center gap-6">
		<h1>Recipes</h1>

		{#if data.recipes.length > 0}
			<RecipeSearch bind:query count={shown.length} />
		{/if}
	</div>

	{#each courses as { course, label, slug, recipes } (course)}
		<!-- A search shows every match. Otherwise a long course previews its first few and links to the rest. -->
		{@const more = !searching && slug && recipes.length > PREVIEW_SIZE}
		<section class="flex flex-col gap-6" aria-labelledby={`course-${course}`}>
			<h2 id={`course-${course}`} class="m-0 text-2xl">
				{#if more}
					<ChevronLink href={`/recipes/${slug}`}>{label}</ChevronLink>
				{:else}
					{label}
				{/if}
			</h2>
			<RecipeCards recipes={more ? recipes.slice(0, PREVIEW_SIZE) : recipes} />
			{#if more}
				<ChevronLink
					href={`/recipes/${slug}`}
					class="self-start text-prose text-muted-foreground"
				>
					All {recipes.length}
					{label.toLowerCase()}
				</ChevronLink>
			{/if}
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
