<script>
    const { children } = $props();
</script>

<svelte:head>
    <title>About</title>
</svelte:head>

<div class="container">
    {@render children()}
</div>

<style>
    .container {
        max-width: 80ch;
        margin: 0 auto;
        flex: 1;
        padding-left: max(1rem, env(safe-area-inset-left));
        padding-right: max(1rem, env(safe-area-inset-right));
    }

    .container :global(a:link) {
        color: #e6f4f1;
    }

    .container :global(a:visited) {
        color: #cde8e5;
    }
</style>
