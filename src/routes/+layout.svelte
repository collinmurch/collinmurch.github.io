<script>
    import { fly } from "svelte/transition";
    import { page } from "$app/stores";
    import "../app.css";
    import Navigation from "$components/Navigation.svelte";
    import { headerLinks } from "$lib/data/navigation";
    import WaveCanvas from "../components/WaveCanvas.svelte";

    const { children } = $props();
    const duration = 300;
    const yLoc = 2000;

    let direction = $state();
    $effect(() => {
        direction = $page.url.pathname === "/" ? yLoc : -yLoc;
    });
</script>

<div class="layout">
    <Navigation location="Header" links={headerLinks} />
    <WaveCanvas />
    <main>
        <div class="content-wrapper">
            {#key $page.url.pathname}
                <div class="padded-content" in:fly={{ y: direction, duration }}>
                    {@render children()}
                </div>
            {/key}
        </div>
    </main>
</div>

<style>
    /* Allow us to do the trnasforms without transition jitter */
    .content-wrapper {
        position: fixed;
        inset: 0;
    }

    .layout {
        min-height: 100svh;
    }

    .padded-content {
        padding: clamp(3rem, 6vw, 8rem) 0 0;
    }

    main {
        color: #e6f4f1;
        position: fixed;
        inset: 0;
    }
</style>
