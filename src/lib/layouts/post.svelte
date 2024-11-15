<script>
    const title = $props();
</script>

<article>
    <h1>{title}</h1>
    <slot />
</article>

<style>
    article {
        max-width: 65ch;
        margin: 0 auto;
        padding: 1rem;
    }
</style>
