<script>
	import { formatDate, toISODate } from "$lib/utils";

	const { data } = $props();
</script>

<div class="mx-auto max-w-[88ch] space-y-10">
	<h1 class="text-3xl font-semibold md:text-4xl">Posts</h1>

	<div class="space-y-8">
		{#each data.posts as post}
			{@const publishedISO = toISODate(post.meta?.date)}
			<article
				class="space-y-3 border-b border-dashed border-border/60 pb-6 last:border-none last:pb-0"
			>
				<h2 class="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
					<a
						class="inline-flex items-center gap-2 text-accent transition duration-150 hover:text-primary"
						href={`/blog/${post.path}`}
					>
						{post.meta?.title}
					</a>
				</h2>
				<time
					datetime={publishedISO ?? undefined}
					class="block text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground"
				>
					{publishedISO ? formatDate(publishedISO) : "Coming soon"}
				</time>
			</article>
		{/each}
	</div>
</div>
