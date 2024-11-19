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

    .content :global(a:link) {
        color: #e6f4f1;
    }

    .content :global(a:visited) {
        color: #cde8e5;
    }

    article {
        margin-top: 1rem;
    }

    /* Override outrageous PrismJS code size */
    .content :global(pre[class*="language-"]) {
        font-size: clamp(0.6rem, 2vmin, 0.9rem);
    }

    .content :global(code[class*="language-"]) {
        font-size: clamp(0.6rem, 2vmin, 0.9rem);
    }
</style>
