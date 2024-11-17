<script>
    import "$lib/styles/prism-nord.css";
    import { formatDate } from "$lib/utils";
    const { data } = $props();
</script>

<div class="container">
    <h1>{data?.post.title}</h1>
    <time>{formatDate(data?.post.date)}</time>

    <article>
        <div class="content">
            {@render data?.post.content()}
        </div>
    </article>
</div>

<style>
    .container {
        max-width: 80ch;
        margin: 0 auto;
    }

    h1 {
        margin-bottom: 0.5rem;
    }

    .content :global(a:link) {
        color: #e6f4f1;
    }

    .content :global(a:visited) {
        color: #cde8e5;
    }

    .content :global(p) {
        line-height: 1rem;
    }

    time {
        font-size: 0.85rem;
        font-style: italic;
    }

    article {
        padding-top: 1rem;
    }
</style>
