<script>
	import BackLink from "#components/BackLink.svelte";
	import { fractionGlyphs } from "#lib/recipes/amounts";
	import { humanize, mealDay, planTitle } from "#lib/recipes/format";
	import { SUBHEADING } from "#lib/recipes/styles";
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

{#snippet groceries(id, label, sections)}
	<section class="flex flex-col gap-4 p-(--block-padding)" aria-labelledby={id}>
		<h2 {id} class="m-0 text-xl">{label}</h2>
		<div class="columns-[15em] gap-x-10">
			{#each sections as section (section.name)}
				<div class="mb-5 break-inside-avoid">
					<h3 class={["mt-2 mb-3 capitalize", SUBHEADING]}>{section.name}</h3>
					<ul class="grid grid-cols-[minmax(4.5em,auto)_1fr] gap-x-5 gap-y-2">
						{#each section.items as item (item.name)}
							<li class="col-span-full grid grid-cols-subgrid">
								<span class="text-muted-foreground">
									{item.amount ? fractionGlyphs(item.amount) : ""}
								</span>
								<span>
									{humanize(item.name)}
									{#if item.optional}
										<span class="text-muted-foreground/70">(optional)</span>
									{/if}
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>
{/snippet}

<div class="mx-auto max-w-measure space-y-8">
	<header class="space-y-3">
		<BackLink href="/recipes/plans">Plans</BackLink>
		<h1>{title}</h1>

		{#each notes as paragraph, index (index)}
			<p class="text-prose whitespace-pre-line text-foreground/85">{paragraph}</p>
		{/each}

		<ul
			class="flex flex-wrap gap-x-2 text-muted-foreground *:not-first:before:me-2 *:not-first:before:content-['·']"
		>
			<li>From {formatDate(plan.start)}</li>
			{#if plan.spent != null}
				<li>Spent ${plan.spent.toFixed(2)}</li>
			{/if}
		</ul>
	</header>

	<article class="panel divide-y divide-panel-edge/15 text-prose">
		<section class="flex flex-col gap-4 p-(--block-padding)" aria-labelledby="meals">
			<h2 id="meals" class="m-0 text-xl">Meals</h2>
			<ul class="flex flex-col gap-3">
				{#each data.meals as meal, index (index)}
					{@const details = [
						meal.date && mealDay(meal.date),
						meal.servings &&
							`${meal.servings} ${meal.servings === 1 ? "serving" : "servings"}`,
					].filter(Boolean)}
					<li class="flex flex-wrap items-baseline justify-between gap-x-4">
						<a href={`/recipes/${meal.recipe}`}>{meal.title}</a>
						{#if details.length > 0}
							<span class="text-base whitespace-nowrap text-muted-foreground">
								{details.join(" · ")}
							</span>
						{/if}
						{#if meal.note}
							<p class="basis-full text-base text-muted-foreground">{meal.note}</p>
						{/if}
					</li>
				{/each}
			</ul>
		</section>

		{#if shopping.length > 0}
			{@render groceries("groceries", "Groceries", shopping)}
		{/if}

		{#if onHand.length > 0}
			{@render groceries("on-hand", "On hand", onHand)}
		{/if}
	</article>
</div>
