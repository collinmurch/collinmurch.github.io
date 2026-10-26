<script>
	import PostDate from "#components/PostDate.svelte";

	const { data } = $props();
</script>

<div class="mx-auto max-w-measure space-y-10">
	<h1>Posts</h1>

	<div class="space-y-8">
		{#each data.posts as post (post.path)}
			<article
				class="space-y-3 border-b border-dashed border-border/60 pb-6 last:border-none last:pb-0"
			>
				<h2 class="text-heading tracking-tight text-foreground">
					<a
						class="text-accent transition duration-150 hover:text-primary"
						href={`/blog/${post.path}`}
					>
						{post.meta.title}
					</a>
				</h2>
				<PostDate date={post.meta.date} />
			</article>
		{/each}
	</div>
</div>
