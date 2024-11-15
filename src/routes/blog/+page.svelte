<script>
    import { formatDate } from "$lib/utils";
    const { data } = $props();
</script>

<svelte:head>
    <title>Blog Posts</title>
</svelte:head>

<h1>Blog Posts</h1>

<div class="posts">
    {#each data.posts as post}
        <article>
            <h2>
                <a href="/blog/{post.slug}">{post.title}</a>
            </h2>
            <time>{formatDate(post.date)}</time>
        </article>
    {/each}
</div>

<style>
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
