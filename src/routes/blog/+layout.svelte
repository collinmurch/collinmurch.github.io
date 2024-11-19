<script>
    const { children } = $props();
</script>

<svelte:head>
    <title>Blog</title>
</svelte:head>

<div class="container">
    {@render children()}
</div>

<style>
    .container {
        margin: 0 auto;
        max-width: 80ch;
        padding: 1rem max(1rem, env(safe-area-inset-right)) 2rem
            max(1rem, env(safe-area-inset-left));
        flex: 1;
    }

    .container :global(time) {
        font-size: 0.85rem;
        font-style: italic;
    }
</style>
