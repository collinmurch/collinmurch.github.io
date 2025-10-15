<script>
    const { children } = $props();
</script>

<svelte:head>
    <title>Blog | Collin Murch</title>
    <meta
        name="description"
        content="Read Collin Murch's latest thoughts on software engineering, architecture, AI, and product development."
    />
    <meta property="og:title" content="Blog | Collin Murch" />
    <meta
        property="og:description"
        content="Read Collin Murch's latest thoughts on software engineering, architecture, AI, and product development."
    />
    <meta name="twitter:title" content="Blog | Collin Murch" />
    <meta
        name="twitter:description"
        content="Read Collin Murch's latest thoughts on software engineering, architecture, AI, and product development."
    />
</svelte:head>

<div class="container">
    {@render children()}
</div>

<style>
    .container {
        margin: 0 auto;
        max-width: 80ch;
        flex: 1;
        padding-left: max(1rem, env(safe-area-inset-left));
        padding-right: max(1rem, env(safe-area-inset-right));
    }

    .container :global(time) {
        font-size: 0.85rem;
        font-style: italic;
    }
</style>
