<script>
	import { planTitle } from "#lib/recipes/bundle";
	import { facets, formatMinutes, humanize, matchesFilters } from "#lib/recipes/format";

	const { data } = $props();

	const FACETS = [
		{ key: "course", label: "Course" },
		{ key: "cuisine", label: "Cuisine" },
		{ key: "protein", label: "Protein" },
	];

	const options = $derived(facets(data.recipes));
	let filters = $state({ course: null, cuisine: null, protein: null });
	const shown = $derived(
		data.recipes.filter((recipe) => matchesFilters(recipe, filters)),
	);

	function toggle(key, value) {
		filters[key] = filters[key] === value ? null : value;
	}

	function details(recipe) {
		return [
			recipe.course,
			recipe.cuisine && humanize(recipe.cuisine),
			recipe.time && formatMinutes(recipe.time),
			recipe.leftovers && `${recipe.leftovers} leftovers`,
		].filter(Boolean);
	}
</script>

<svelte:head>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="Recipes"
		href="/recipes/feed.xml"
	/>
</svelte:head>

<div class="mx-auto max-w-measure space-y-10">
	<h1>Recipes</h1>

	{#if data.recipes.length === 0}
		<p class="text-prose text-muted-foreground">Nothing in the kitchen yet.</p>
	{:else}
		<div class="space-y-3">
			{#each FACETS as facet (facet.key)}
				{#if options[facet.key].length > 1}
					<div
						role="group"
						aria-label={facet.label}
						class="flex flex-wrap items-center gap-2"
					>
						<span
							class="w-[5.5rem] text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase"
						>
							{facet.label}
						</span>
						{#each options[facet.key] as value (value)}
							{@const pressed = filters[facet.key] === value}
							<button
								type="button"
								aria-pressed={pressed}
								onclick={() => toggle(facet.key, value)}
								class={[
									"cursor-pointer touch-manipulation rounded-full border px-3 py-1 text-sm capitalize transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring",
									pressed
										? "border-transparent bg-primary text-primary-foreground"
										: "border-border/70 text-foreground/80 hover:text-foreground",
								]}
							>
								{humanize(value)}
							</button>
						{/each}
					</div>
				{/if}
			{/each}
		</div>

		<div class="space-y-8" aria-live="polite">
			{#each shown as recipe (recipe.slug)}
				<article
					class="space-y-3 border-b border-dashed border-border/60 pb-6 last:border-none last:pb-0"
				>
					<h2
						class="text-[clamp(1.5rem,1.25rem+0.75vw,1.875rem)] font-semibold tracking-tight text-foreground"
					>
						<a
							class="text-accent transition duration-150 hover:text-primary"
							href={`/recipes/${recipe.slug}`}
						>
							{recipe.title}
						</a>
					</h2>
					{#if recipe.description}
						<p class="text-prose">{recipe.description}</p>
					{/if}
					<p
						class="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase"
					>
						{details(recipe).join(" · ")}
					</p>
				</article>
			{:else}
				<p class="text-prose text-muted-foreground">Nothing matches those filters.</p>
			{/each}
		</div>
	{/if}

	{#if data.plans.length > 0}
		<section class="space-y-4">
			<h2>Plans</h2>
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
