<script>
	import { formatDate, toISODate } from "$lib/utils";

	const { data } = $props();

	function buildDescription(post) {
		if (!post) return "Article by Collin Murch.";
		if (post.description) return post.description;
		if (post.excerpt) return post.excerpt;
		const published = post.date ? ` Published ${formatDate(post.date)}.` : "";
		return `${post.title ?? "Article"} – A post from Collin Murch.${published}`.trim();
	}

	const pageTitle = $derived(
		data?.post?.title
			? `${data.post.title} | Collin Murch`
			: "Blog Post | Collin Murch",
	);

	const description = $derived(buildDescription(data?.post));

	const publishedISO = $derived(toISODate(data?.post?.date));
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={description} />
</svelte:head>

<div class="mx-auto max-w-[88ch]">
	<h1 class="text-3xl font-semibold md:text-4xl mb-2">{data?.post.title}</h1>
	<time
		datetime={publishedISO ?? undefined}
		class="mb-8 block text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground"
	>
		{publishedISO ? formatDate(publishedISO) : "Coming soon"}
	</time>

	<article class="prose-rich space-y-8">
		{@render data?.post.content()}
	</article>
</div>
