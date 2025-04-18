<script>
    import { formatDate } from "$lib/utils";

    const { data } = $props();
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
        background-image: linear-gradient(
            to right,
            #eee 10%,
            rgba(255, 255, 255, 0) 0%
        );
        background-position: bottom;
        background-size: 6px 1px; /* adjust this value to change dot spacing */
        background-repeat: repeat-x;
        padding-bottom: 0.5rem;
    }

    h2 {
        margin: 0;
    }
</style>
