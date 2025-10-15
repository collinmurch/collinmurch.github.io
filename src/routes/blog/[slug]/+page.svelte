<script>
import "$lib/styles/prism-poimandres.css";
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

<h1>{data?.post.title}</h1>
<time>{formatDate(data?.post.date)}</time>

<article>
    <div class="content">
        {@render data?.post.content()}
    </div>
</article>

<style>
    h1 {
        margin-bottom: 0.5rem;
    }

    article {
        margin-top: 1rem;
    }

    .content :global(pre),
    .content :global(code) {
        font-size: 0.85rem;
    }
</style>
