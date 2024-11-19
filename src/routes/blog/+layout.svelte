<script>
    const { children } = $props();
</script>

<div class="container">
    {@render children()}
</div>

<style>
    .container {
        max-width: 80ch;
        margin: 0 auto;
    }

    .container :global(time) {
        font-size: 0.85rem;
        font-style: italic;
    }
</style>
