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
        max-width: 80ch;
        margin: 0 auto;
        padding-left: max(1rem, env(safe-area-inset-left));
        padding-right: max(1rem, env(safe-area-inset-right));
    }

    .container :global(time) {
        font-size: 0.85rem;
        font-style: italic;
    }
</style>
