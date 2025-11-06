<script>
import { formatDate } from "$lib/utils";

const { data } = $props();

const pageTitle = $derived(() => {
    if (!data?.post?.title) return "Blog Post | Collin Murch";
    return `${data.post.title} | Collin Murch`;
});

const description = $derived(() => {
    if (data?.post?.description) return data.post.description;
    if (data?.post?.excerpt) return data.post.excerpt;
    if (data?.post?.title) {
        const published = data.post.date
            ? `Published ${formatDate(data.post.date)}.`
            : "";
        return `${data.post.title} – A post from Collin Murch. ${published}`.trim();
    }
    return "Article by Collin Murch.";
});
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
    <h1 class="text-4xl font-semibold md:text-5xl">{data?.post.title}</h1>
    <time
        class="mb-6 block text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground"
    >
        {formatDate(data?.post.date)}
    </time>

    <article class="prose-rich space-y-8">
        {@render data?.post.content()}
    </article>
</div>
