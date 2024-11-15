<script>
    import { formatDate } from "$lib/utils";
    const { data } = $props();
</script>

<article>
    <h1>{data.post.title}</h1>
    <time>{formatDate(data.post.date)}</time>

    <div class="content">
        {@render data.post.content()}
    </div>
</article>
