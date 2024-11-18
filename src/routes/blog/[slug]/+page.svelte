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

    .content :global(code) {
        font-size: 0.9rem;
    }

    time {
        font-size: 0.9rem;
        font-style: italic;
    }

    article {
        padding-top: 1rem;
    }
</style>
