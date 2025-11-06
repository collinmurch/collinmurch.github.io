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

{@render children()}
