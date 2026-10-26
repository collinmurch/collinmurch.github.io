<script>
	import ChevronLink from "#components/ChevronLink.svelte";
	import RecipeCards from "#components/RecipeCards.svelte";
	import RecipeSearch from "#components/RecipeSearch.svelte";
	import { matchesSearch } from "#lib/recipes/listing";

	const { data } = $props();

	let query = $state("");
	const shown = $derived(data.recipes.filter((recipe) => matchesSearch(recipe, query)));

	const pageTitle = $derived(`${data.label} | Recipes | Collin Murch`);
	const description = $derived(
		`Every ${data.label.toLowerCase()} recipe from Collin Murch's kitchen.`,
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={description} />
</svelte:head>

<div class="mx-auto max-w-measure space-y-14">
	<header class="space-y-4">
		<ChevronLink href="/recipes" back class="text-prose text-muted-foreground">
			Recipes
		</ChevronLink>
		<div class="grid grid-cols-[auto_1fr] items-center gap-6">
			<h1>{data.label}</h1>
			<RecipeSearch bind:query count={shown.length} />
		</div>
	</header>

	{#if shown.length > 0}
		<RecipeCards recipes={shown} />
	{:else}
		<p class="text-prose text-muted-foreground">
			No {data.label.toLowerCase()} match that search.
		</p>
	{/if}
</div>
