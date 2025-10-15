<script>
    const { children } = $props();
</script>

<svelte:head>
    <title>About | Collin Murch</title>
    <meta
        name="description"
        content="Discover Collin Murch's engineering background, interests, and how to get in touch."
    />
    <meta property="og:title" content="About | Collin Murch" />
    <meta
        property="og:description"
        content="Discover Collin Murch's engineering background, interests, and how to get in touch."
    />
    <meta name="twitter:title" content="About | Collin Murch" />
    <meta
        name="twitter:description"
        content="Discover Collin Murch's engineering background, interests, and how to get in touch."
    />
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
        color: var(--link-color);
        text-decoration-color: var(--link-decoration-color);
    }

    .container :global(a:visited) {
        color: var(--link-visited-color);
        text-decoration-color: var(--link-decoration-visited-color);
    }
</style>
