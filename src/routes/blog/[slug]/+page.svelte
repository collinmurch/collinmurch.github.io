<script>
    import "$lib/styles/prism-laserwave.css";
    import { formatDate } from "$lib/utils";

    const { data } = $props();
</script>

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
