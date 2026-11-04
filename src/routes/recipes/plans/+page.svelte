<script>
	import BackLink from "#components/BackLink.svelte";
	import PlanList from "#components/PlanList.svelte";

	const { data } = $props();

	const pageTitle = "Plans | Recipes | Collin Murch";
	const description = "Every week of meals and groceries from Collin Murch's kitchen.";
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
	<header>
		<BackLink href="/recipes">Recipes</BackLink>
		<h1>Plans</h1>
	</header>

	{#if data.plans.length > 0}
		<PlanList plans={data.plans} />
	{:else}
		<p class="text-prose text-muted-foreground">No plans yet.</p>
	{/if}
</div>
