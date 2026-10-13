<script>
	import Button from "$components/Button.svelte";
	import ButtonGroup from "$components/ButtonGroup.svelte";
	import CopyButton from "$components/CopyButton.svelte";
	import PostDate from "$components/PostDate.svelte";

	const { data } = $props();

	const post = $derived(data.post);
	const pageTitle = $derived(`${post.title} | Collin Murch`);
	const Content = $derived(post.content);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={post.description} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={post.description} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={post.description} />
</svelte:head>

<div class="mx-auto max-w-measure">
	<div class="mb-2 flex items-center justify-between gap-4">
		<h1>{post.title}</h1>

		<div class="-me-2 shrink-0">
			<ButtonGroup variant="quiet" label="Share">
				<CopyButton
					icon="link"
					label="Copy link"
					copiedLabel="Link copied"
					text={() => `${location.origin}${location.pathname}`}
				/>
				<Button icon="code" label="View Markdown source" href={post.sourceUrl} />
			</ButtonGroup>
		</div>
	</div>
	<PostDate date={post.date} class="mb-8" />

	<article class="prose-rich space-y-8">
		<Content />
	</article>
</div>
