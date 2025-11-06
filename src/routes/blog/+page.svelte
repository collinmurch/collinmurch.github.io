<script>
    import { formatDate } from "$lib/utils";

    const { data } = $props();
</script>

<div class="mx-auto max-w-[88ch] space-y-10">
    <h1 class="text-4xl font-semibold md:text-5xl">Posts</h1>

    <div class="space-y-8">
        {#each data.posts as post}
            <article
                class="space-y-3 border-b border-dashed border-border/60 pb-6 last:border-none last:pb-0"
            >
                <h2 class="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    <a
                        class="inline-flex items-center gap-2 text-accent transition duration-150 hover:text-primary"
                        href="/blog/{post.path}"
                    >
                        {post.meta?.title}
                    </a>
                </h2>
                <time
                    class="block text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground"
                >
                    {formatDate(post.meta?.date)}
                </time>
            </article>
        {/each}
    </div>
</div>
