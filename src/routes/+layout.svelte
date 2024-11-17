<script>
    import "../app.css";
    import Nav from "$components/Nav.svelte";
    import { headerLinks } from "$lib/data/navigation";
    const { children } = $props();
</script>

<div class="layout">
    <Nav location="Header" links={headerLinks} />
    <main>
        {#key children}
            {@render children()}
        {/key}
    </main>
</div>

<style>
    .layout {
        min-height: 100dvh;
    }

    main {
        padding-top: 4rem; /* Adjust this value based on your navbar height */
    }
</style>
