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

<div
    class="mx-auto flex-1 max-w-[80ch] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
>
    {@render children()}
</div>
