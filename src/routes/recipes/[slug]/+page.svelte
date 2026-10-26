<script>
	import Button from "#components/Button.svelte";
	import ButtonGroup from "#components/ButtonGroup.svelte";
	import CopyButton from "#components/CopyButton.svelte";
	import RecipeCards from "#components/RecipeCards.svelte";
	import { fractionGlyphs, scaleAmounts } from "#lib/recipes/amounts";
	import {
		describeSource,
		formatMinutes,
		humanize,
		stepRuns,
		tokenText,
	} from "#lib/recipes/format";

	const { data } = $props();

	const SUBHEADING =
		"flex items-center gap-3 text-base text-accent after:h-px after:flex-1 after:bg-panel-edge/15";

	const TOKEN_CLASSES = {
		ingredient: "font-semibold text-accent",
		timer: "font-semibold whitespace-nowrap",
	};

	const recipe = $derived(data.recipe);
	const pageTitle = $derived(`${recipe.title} | Collin Murch`);
	const description = $derived(
		recipe.description ?? `How to make ${recipe.title}, from Collin Murch's kitchen.`,
	);
	const source = $derived(recipe.source ? describeSource(recipe.source) : null);

	const MAX_SERVINGS = 99;

	let servings = $derived(recipe.servings);
	const factor = $derived(servings / recipe.servings);

	const amount = (item) =>
		fractionGlyphs(scaleAmounts(item.amounts, factor, data.units));
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={description} />
	{@html data.jsonLd}
</svelte:head>

<div class="mx-auto max-w-measure space-y-8">
	<header class="space-y-3">
		<div class="flex items-start justify-between gap-4">
			<h1>{recipe.title}</h1>

			<div class="-me-2 shrink-0">
				<ButtonGroup variant="quiet" label="Share">
					<CopyButton
						icon="link"
						label="Copy link"
						copiedLabel="Link copied"
						text={() => `${location.origin}${location.pathname}`}
					/>
					<Button icon="code" label="View Cooklang source" href={data.sourceUrl} />
				</ButtonGroup>
			</div>
		</div>

		{#if recipe.description}
			<p class="text-prose text-foreground/85">{recipe.description}</p>
		{/if}

		<ul
			class="flex flex-wrap gap-x-2 text-muted-foreground *:not-first:before:me-2 *:not-first:before:content-['·']"
		>
			{#if recipe.cuisine}
				<li class="capitalize">{humanize(recipe.cuisine)}</li>
			{/if}
			{#if recipe.time_total}
				<li>{formatMinutes(recipe.time_total)} total</li>
			{/if}
			{#if recipe.time_active}
				<li>{formatMinutes(recipe.time_active)} active</li>
			{/if}
			{#if source}
				<li>
					From
					{#if source.href}
						<a href={source.href}>{source.text}</a>
					{:else}
						{source.text}
					{/if}
				</li>
			{/if}
			{#if recipe.times_cooked > 0}
				<li>
					Made {recipe.times_cooked === 1 ? "once" : `${recipe.times_cooked} times`}
				</li>
			{/if}
		</ul>
	</header>

	<article class="panel divide-y divide-panel-edge/15 text-prose">
		<section
			class="flex flex-col gap-4 p-(--block-padding)"
			aria-labelledby="ingredients"
		>
			<div
				class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 *:last:ms-auto"
			>
				<h2 id="ingredients" class="m-0 text-xl">Ingredients</h2>

				<ButtonGroup label="Servings">
					<Button
						icon="minus"
						label="Fewer servings"
						disabled={servings <= 1}
						onclick={() => servings--}
					/>
					<output
						aria-live="polite"
						class="grid items-center justify-items-center border-s border-accent/14 px-3 text-sm whitespace-nowrap tabular-nums *:col-start-1 *:row-start-1"
					>
						<span class="invisible">{MAX_SERVINGS} servings</span>
						<span>{servings} {servings === 1 ? "serving" : "servings"}</span>
					</output>
					<Button
						icon="plus"
						label="More servings"
						disabled={servings >= MAX_SERVINGS}
						onclick={() => servings++}
					/>
				</ButtonGroup>
			</div>

			{#each recipe.ingredients as group, groupIndex (groupIndex)}
				<div>
					{#if group.section}
						<h3 class={["mt-2 mb-3", SUBHEADING]}>{group.section}</h3>
					{/if}
					<ul class="grid grid-cols-[minmax(4.5em,auto)_1fr] gap-x-5 gap-y-2">
						{#each group.items as item, itemIndex (itemIndex)}
							{@const extras = [item.note, item.optional && "optional"].filter(Boolean)}
							<li class="col-span-full grid grid-cols-subgrid">
								<span class="text-muted-foreground">{amount(item)}</span>
								<span>
									{item.text}
									{#if extras.length > 0}
										<span class="text-muted-foreground/70">({extras.join(", ")})</span>
									{/if}
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{/each}

			{#if recipe.cookware.length > 0}
				<p class="text-base text-muted-foreground">
					Equipment: {recipe.cookware.join(", ")}
				</p>
			{/if}
		</section>

		<section class="flex flex-col gap-4 p-(--block-padding)" aria-labelledby="method">
			<h2 id="method" class="m-0 text-xl">Method</h2>

			{#each recipe.sections as section, sectionIndex (sectionIndex)}
				{#if section.name}
					<h3 class={["mt-4 mb-0", SUBHEADING]}>{section.name}</h3>
				{/if}
				{#each stepRuns(section.content) as run, runIndex (runIndex)}
					{#if run.type === "note"}
						<p class="border-s-2 border-accent/30 ps-4 text-muted-foreground italic">
							{run.text}
						</p>
					{:else}
						<ol
							start={run.steps[0].number}
							class="list-decimal space-y-3 ps-[1.25em] marker:text-muted-foreground"
						>
							{#each run.steps as step (step.number)}
								<li class="ps-2">
									{#each step.tokens as token, tokenIndex (tokenIndex)}<span
											class={TOKEN_CLASSES[token.type]}>{tokenText(token)}</span
										>{/each}
								</li>
							{/each}
						</ol>
					{/if}
				{/each}
			{/each}
		</section>
	</article>

	{#if data.pairs.length > 0}
		<section class="flex flex-col gap-6" aria-labelledby="pairs">
			<h2 id="pairs" class="m-0 text-heading">Goes with</h2>
			<RecipeCards recipes={data.pairs} />
		</section>
	{/if}
</div>
