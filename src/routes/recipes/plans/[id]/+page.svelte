<script>
	import { planTitle } from "#lib/recipes/bundle";
	import { humanize } from "#lib/recipes/format";
	import { formatDate } from "#lib/utils/dates";

	const { data } = $props();

	const plan = $derived(data.plan);
	const title = $derived(planTitle(plan));
	const pageTitle = $derived(`${title} | Collin Murch`);
	const description = $derived(`Meals and groceries for ${title}.`);
	const notes = $derived(plan.notes ? plan.notes.split(/\n\s*\n/) : []);
	const shopping = $derived(
		(plan.groceries ?? []).filter((section) => !section.staple),
	);
	const onHand = $derived((plan.groceries ?? []).filter((section) => section.staple));
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

{#snippet groceryList(sections)}
	{#each sections as section (section.name)}
		<h3 class="capitalize">{section.name}</h3>
		<ul>
			{#each section.items as item (item.name)}
				<li>
					{humanize(item.name)}{#if item.amount}, {item.amount}{/if}
					{#if item.optional}
						<span class="text-muted-foreground">(optional)</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/each}
{/snippet}

<div class="mx-auto max-w-measure">
	<h1 class="mb-2 capitalize">{title}</h1>
	<p class="mb-8 text-muted-foreground">
		From {formatDate(plan.start)}{#if plan.spent != null}
			· spent ${plan.spent.toFixed(2)}{/if}
	</p>

	<article class="prose-rich space-y-8">
		{#each notes as paragraph, index (index)}
			<p class="whitespace-pre-line">{paragraph}</p>
		{/each}

		<section>
			<h2>Meals</h2>
			<ul>
				{#each data.meals as meal, index (index)}
					<li>
						<a href={`/recipes/${meal.recipe}`}>{meal.title}</a>
						{#if meal.servings}
							for {meal.servings}
						{/if}
						<span class="text-muted-foreground">
							{#if meal.cooked}
								· made {formatDate(meal.cooked)}
							{:else if meal.date}
								· planned for {formatDate(meal.date)}
							{/if}
						</span>
						{#if meal.note}
							<br /><span class="text-muted-foreground">{meal.note}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</section>

		{#if shopping.length > 0}
			<section>
				<h2>Groceries</h2>
				{@render groceryList(shopping)}
			</section>
		{/if}

		{#if onHand.length > 0}
			<section>
				<h2>On hand</h2>
				{@render groceryList(onHand)}
			</section>
		{/if}
	</article>
</div>
