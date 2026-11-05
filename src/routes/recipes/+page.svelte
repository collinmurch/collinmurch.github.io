<script>
	import PlanList from "#components/PlanList.svelte";
	import PreviewSection from "#components/PreviewSection.svelte";
	import RecipeCards from "#components/RecipeCards.svelte";
	import RecipeSearch from "#components/RecipeSearch.svelte";
	import {
		byCourse,
		CAROUSEL_SIZE,
		matchesSearch,
		PLAN_PREVIEW_SIZE,
	} from "#lib/recipes/listing";

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
		<!-- A search shows every match, so it never links away to a course page. -->
		<PreviewSection
			id={`course-${course}`}
			{label}
			items={recipes}
			href={!searching && slug ? `/recipes/${slug}` : null}
			limit={CAROUSEL_SIZE}
			inline
		>
			{#snippet list(shown, all)}
				<RecipeCards recipes={shown} carousel={!searching} {all} />
			{/snippet}
		</PreviewSection>
	{:else}
		<p class="text-prose text-muted-foreground">
			{data.recipes.length === 0
				? "Nothing in the kitchen yet."
				: "No recipes match that search."}
		</p>
	{/each}

	{#if data.plans.length > 0}
		<PreviewSection
			id="plans"
			label="Plans"
			items={data.plans}
			href="/recipes/plans"
			limit={PLAN_PREVIEW_SIZE}
		>
			{#snippet list(shown)}<PlanList plans={shown} />{/snippet}
		</PreviewSection>
	{/if}
</div>
