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
            <time class="post-date">{formatDate(post.meta?.date)}</time>
        </article>
    {/each}
</div>

<style>
    a {
        transition: color 150ms ease, text-decoration-color 150ms ease;
    }

    a:link {
        color: var(--link-color);
        text-decoration-color: var(--link-decoration-color);
    }

    a:visited {
        color: var(--link-visited-color);
        text-decoration-color: var(--link-decoration-visited-color);
    }

    .posts {
        display: grid;
        gap: 2rem;
        max-width: var(--reading-width);
    }

    article {
        max-width: var(--reading-width);
        padding-bottom: 0.5rem;
        font-size: clamp(1.1rem, 1.04rem + 0.35vw, 1.35rem);
        line-height: 1.6;
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

    .post-date {
        display: block;
        margin-bottom: 0.25rem;
    }
</style>
