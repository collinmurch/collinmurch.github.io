<script>
    import { formatDate } from "$lib/utils";
    const { data } = $props();
</script>

<article>
    <h1>{data.post.title}</h1>
    <time>{formatDate(data.post.date)}</time>

    <div class="content">
        {@render data.post?.content()}
    </div>
</article>

<style>
    article {
        max-width: 80ch;
        margin: 0 auto;
        padding: 2rem;
    }

    .content :global(p) {
        line-height: 1.6;
    }

    time {
        color: #666;
        font-size: 0.9rem;
    }
</style>
