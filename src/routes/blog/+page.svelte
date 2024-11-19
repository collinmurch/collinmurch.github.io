<script>
    import { formatDate } from "$lib/utils";

    let { data } = $props();
</script>

<h1>Posts</h1>

<div class="posts">
    {#each data.posts as post}
        <article>
            <h2>
                <a href="/blog/{post.path}">{post.meta?.title}</a>
            </h2>
            <time>{formatDate(post.meta?.date)}</time>
        </article>
    {/each}
</div>

<style>
    h1 {
        padding-bottom: 1.5rem;
    }

    a:link {
        color: #e6f4f1;
    }

    a:visited {
        color: #cde8e5;
    }

    .posts {
        display: grid;
        gap: 2rem;
    }

    article {
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }

    h2 {
        margin: 0;
    }
</style>
