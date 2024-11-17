<script>
    import { formatDate } from "$lib/utils";

    /** @type {import('./$types').PageData} */
    let { data } = $props();
</script>

<svelte:head>
    <title>Blog Posts</title>
</svelte:head>

<div class="container">
    <h1>Blog Posts</h1>

    <div class="posts">
        {#each data.posts as post}
            <article>
                <h2>
                    <a href="/blog/{post.path}">{post.meta.title}</a>
                </h2>
                <time>{formatDate(post.meta.date)}</time>
            </article>
        {/each}
    </div>
</div>

<style>
    .container {
        max-width: 80ch;
        margin: 0 auto;
    }

    .posts {
        display: grid;
        gap: 2rem;
    }

    article {
        border-bottom: 1px solid #eee;
        padding-bottom: 1rem;
    }

    h2 {
        margin: 0;
    }

    time {
        color: #666;
        font-size: 0.9rem;
    }
</style>
