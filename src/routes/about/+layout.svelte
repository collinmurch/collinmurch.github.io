<script>
    const { children } = $props();
</script>

<div class="container">
    {@render children()}
</div>

<svelte:head>
    <title>About</title>
</svelte:head>

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
