<script>
	import Button from "#components/Button.svelte";
	import ButtonGroup from "#components/ButtonGroup.svelte";
	import CopyButton from "#components/CopyButton.svelte";
	import {
		describeSource,
		formatMinutes,
		humanize,
		stepRuns,
		tokenText,
	} from "#lib/recipes/format";
	import { formatDate } from "#lib/utils/dates";

	const { data } = $props();

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
	const details = $derived(
		[
			recipe.course,
			recipe.cuisine && humanize(recipe.cuisine),
			`serves ${recipe.servings}`,
			recipe.time_active && `${formatMinutes(recipe.time_active)} active`,
			recipe.time_total && `${formatMinutes(recipe.time_total)} total`,
			recipe.leftovers && `${recipe.leftovers} leftovers`,
		].filter(Boolean),
	);
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

<div class="mx-auto max-w-measure">
	<div class="mb-2 flex items-center justify-between gap-4">
		<h1>{recipe.title}</h1>

		<div class="-me-2 shrink-0">
			<ButtonGroup variant="quiet" label="Share">
				<CopyButton
					icon="link"
					label="Copy link"
					copiedLabel="Link copied"
					text={() => `${location.origin}${location.pathname}`}
				/>
				<Button
					icon="code"
					label="View Cooklang source"
					href={`/recipes/${recipe.slug}.cook`}
				/>
			</ButtonGroup>
		</div>
	</div>
	<p
		class="mb-8 text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase"
	>
		{details.join(" · ")}
	</p>

	<article class="prose-rich space-y-8">
		{#if recipe.description || source || recipe.times_cooked > 0}
			<div>
				{#if recipe.description}
					<p>{recipe.description}</p>
				{/if}
				{#if source}
					<p class="text-muted-foreground">
						From
						{#if source.href}
							<a href={source.href}>{source.text}</a>
						{:else}
							{source.text}
						{/if}
					</p>
				{/if}
				{#if recipe.times_cooked > 0}
					<p class="text-muted-foreground">
						Made {recipe.times_cooked === 1 ? "once" : `${recipe.times_cooked} times`},
						most recently {formatDate(recipe.last_cooked)}.
					</p>
				{/if}
			</div>
		{/if}

		<section>
			<h2>Ingredients</h2>
			{#each recipe.ingredients as group, groupIndex (groupIndex)}
				{#if group.section}
					<h3>{group.section}</h3>
				{/if}
				<ul>
					{#each group.items as item, itemIndex (itemIndex)}
						<li>{item.line}</li>
					{/each}
				</ul>
			{/each}
		</section>

		{#if recipe.cookware.length > 0}
			<section>
				<h2>Equipment</h2>
				<ul>
					{#each recipe.cookware as tool (tool)}
						<li>{tool}</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section>
			<h2>Method</h2>
			{#each recipe.sections as section, sectionIndex (sectionIndex)}
				{#if section.name}
					<h3>{section.name}</h3>
				{/if}
				{#each stepRuns(section.content) as run, runIndex (runIndex)}
					{#if run.type === "note"}
						<blockquote>{run.text}</blockquote>
					{:else}
						<ol start={run.steps[0].number}>
							{#each run.steps as step (step.number)}
								<li>
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

		{#if data.pairs.length > 0}
			<section>
				<h2>Goes with</h2>
				<ul>
					{#each data.pairs as pair (pair.slug)}
						<li><a href={`/recipes/${pair.slug}`}>{pair.title}</a></li>
					{/each}
				</ul>
			</section>
		{/if}
	</article>
</div>
